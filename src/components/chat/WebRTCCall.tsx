"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Video, X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, collection, addDoc, onSnapshot, updateDoc, collectionGroup, query, where, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";

const servers = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

interface WebRTCCallProps {
    mode: "voice" | "video";
    callerId: string;
    calleeId: string;
    calleeName: string;
    onClose: () => void;
}

export default function WebRTCCall({ mode, callerId, calleeId, calleeName, onClose }: WebRTCCallProps) {
    const [status, setStatus] = useState<"initializing" | "ringing" | "connected" | "ended">("initializing");
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(mode === "voice");

    const pc = useRef<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const callId = useRef<string | null>(null);
    const setupStarted = useRef(false);

    useEffect(() => {
        if (!setupStarted.current) {
            setupStarted.current = true;
            setupCall();
        }
        return () => {
            localStream?.getTracks().forEach(t => t.stop());
            pc.current?.close();
        };
    }, []);

    const setupCall = async () => {
        try {
            // 1. Get Local Media
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: mode === "video" ? { width: 1280, height: 720 } : false
            });

            setLocalStream(stream);

            // 2. Setup PeerConnection
            pc.current = new RTCPeerConnection(servers);
            
            // Add local tracks
            stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

            // Setup remote listener
            pc.current.ontrack = (event) => {
                const newStream = event.streams[0] || new MediaStream([event.track]);
                setRemoteStream(newStream);
                setStatus("connected");
            };



            // 3. Create Call Document
            const callDoc = await addDoc(collection(db, "calls"), {
                callerId,
                calleeId,
                status: "ringing",
                mode,
                createdAt: serverTimestamp()
            });
            callId.current = callDoc.id;
            setStatus("ringing");

            // 4. Handle ICE Candidates (Caller -> Callee)
            pc.current.onicecandidate = (event) => {
                if (event.candidate) {
                    addDoc(collection(db, "calls", callDoc.id, "callerCandidates"), event.candidate.toJSON());
                }
            };

            // 5. Create Offer
            const offerDescription = await pc.current.createOffer();
            await pc.current.setLocalDescription(offerDescription);

            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
            };

            await updateDoc(doc(db, "calls", callDoc.id), { offer });

            // 6. Listen for Answer
            onSnapshot(doc(db, "calls", callDoc.id), (snapshot) => {
                const data = snapshot.data();
                if (pc.current && pc.current.signalingState === "have-local-offer" && data?.answer?.type) {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    pc.current.setRemoteDescription(answerDescription);
                }
                if (data?.status === "ended") terminateCall();
            });

            // 7. Listen for ICE Candidates (Callee -> Caller)
            onSnapshot(collection(db, "calls", callDoc.id, "calleeCandidates"), (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const data = change.doc.data();
                        pc.current?.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });

        } catch (err) {
            console.error("Call setup fail:", err);
            setStatus("ended");
        }
    };

    const terminateCall = async () => {
        if (status === "ended") return;
        
        try {
            if (callId.current) {
                await updateDoc(doc(db, "calls", callId.current), { 
                    status: "ended",
                    endedAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error("Cleanup error:", err);
        }

        setStatus("ended");
        
        if (localStream) {
            localStream.getTracks().forEach(t => {
                t.stop();
                t.enabled = false;
            });
            setLocalStream(null);
        }

        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }

        setTimeout(() => {
            onClose();
            window.location.reload(); // Auto-refresh as requested
        }, 800);
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff; // enabled should be the opposite of the current "Off" state
            });
            setIsVideoOff(!isVideoOff);
        }
    };


    const [isLoudspeaker, setIsLoudspeaker] = useState(true);

    const toggleSpeaker = async () => {
        setIsLoudspeaker(!isLoudspeaker);
    };

    const dialtoneObj = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!dialtoneObj.current) {
            dialtoneObj.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2347/2347-preview.mp3");
            dialtoneObj.current.loop = true;
            dialtoneObj.current.volume = 0.5;
        }

        if (status === "ringing") {
            dialtoneObj.current.play().catch(e => console.log("Dialtone blocked"));
        } else {
            dialtoneObj.current.pause();
            dialtoneObj.current.currentTime = 0;
        }

        return () => {
            dialtoneObj.current?.pause();
        };
    }, [status]);

    return (
        <div className="fixed inset-0 z-[300] bg-background flex flex-col items-center justify-center p-6 sm:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>


            {/* Remote Video (Full Screen) */}
            <div className="relative w-full h-full max-w-6xl aspect-video bg-card rounded-[56px] overflow-hidden border border-border shadow-3xl flex flex-col items-center justify-center">
                {mode === "video" ? (
                    <>
                        {remoteStream ? (
                            <video 
                                ref={(el) => { if (el && remoteStream) el.srcObject = remoteStream; }}
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold uppercase tracking-[0.5em] animate-pulse bg-background">Linking Video Stream...</div>
                        )}
                        {/* Local Video Overlay */}
                        <div className="absolute bottom-10 right-10 w-48 sm:w-80 aspect-video bg-background rounded-3xl border-2 border-primary/30 overflow-hidden shadow-2xl z-20">
                            <video 
                                ref={(el) => { if (el && localStream) el.srcObject = localStream; }}
                                autoPlay 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-48 h-48 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mb-8 animate-pulse relative">
                            <Phone className="w-24 h-24 text-primary" />
                            <div className="absolute -inset-8 border-4 border-emerald-500/10 rounded-full animate-[ping_2s_infinite]"></div>
                            <div className="absolute -inset-12 border-2 border-emerald-500/5 rounded-full animate-[ping_3s_infinite]"></div>
                        </div>
                        <h2 className="text-5xl font-black text-foreground italic uppercase tracking-tighter mb-4">{calleeName}</h2>
                        <p className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">
                            {status === "ringing" ? "Signal Transmitting :: Neural Search Active" : status === "connected" ? "Neural Link Active" : "Initializing..."}
                        </p>
                        <audio 
                            ref={(el) => { if (el && remoteStream) el.srcObject = remoteStream; }}
                            autoPlay 
                            playsInline 
                        />
                    </div>
                )}

            </div>


            {/* Controls */}
            <div className="mt-12 flex items-center gap-6 sm:gap-10">
                <Button 
                    onClick={toggleMic}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all ${isMuted ? "bg-red-500 border-red-500 text-foreground" : "bg-card border-white/10 text-muted-foreground hover:text-foreground"}`}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button 
                    onClick={() => terminateCall()}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-600 hover:bg-red-700 text-foreground shadow-2xl shadow-red-600/30 transition-all hover:scale-110 border-4 border-slate-950"
                >
                    <PhoneOff className="w-10 h-10 sm:w-12 sm:h-12" />
                </Button>
                <Button 
                    onClick={toggleSpeaker}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all ${isLoudspeaker ? "bg-primary/20 border-primary/50 text-primary" : "bg-card border-white/10 text-muted-foreground"}`}
                >
                    {isLoudspeaker ? <Volume2 /> : <Phone className="w-6 h-6" />}
                </Button>

                {mode === "video" && (
                    <Button 
                        onClick={toggleVideo}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all ${isVideoOff ? "bg-red-500 border-red-500 text-foreground" : "bg-card border-white/10 text-muted-foreground hover:text-foreground"}`}
                    >
                        {isVideoOff ? <VideoOff /> : <VideoIcon />}
                    </Button>
                )}

            </div>

            
            {status === "ended" && (
                <div className="absolute inset-x-0 bottom-0 py-8 bg-red-600 text-foreground text-center font-black uppercase tracking-[0.3em] text-sm animate-pulse z-[400]">
                    Neural Link Terminated
                </div>
            )}

        </div>
    );
}
