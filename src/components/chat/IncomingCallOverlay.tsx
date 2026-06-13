"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Video, Check, PhoneOff, Volume2, Mic, MicOff, VideoOff } from "lucide-react";



import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, collection, onSnapshot, updateDoc, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const servers = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

interface IncomingCallProps {
    user: any;
}

export default function IncomingCallOverlay({ user }: IncomingCallProps) {
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [isAnswering, setIsAnswering] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    
    const pc = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const setupStarted = useRef(false);

    const forceRelease = () => {
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

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
        setRemoteStream(null);
        setIsAnswering(false);
        setupStarted.current = false;
        
        // Auto-refresh as requested to clear all processes
        window.location.reload();
    };



    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "calls"), 
            where("calleeId", "==", user.uid), 
            where("status", "in", ["ringing", "connected"])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const callDoc = snapshot.docs[0];
                const callData = { id: callDoc.id, ...callDoc.data() } as any;
                setIncomingCall(callData);
                
                if (callData.status === "connected") {
                    setIsAnswering(true);
                    setupStarted.current = true;
                }
            } else {
                // IMPORTANT: Only trigger release if we actually had a call in state
                // This prevents the infinite refresh loop on page load
                setIncomingCall(prev => {
                    if (prev) {
                        setTimeout(() => forceRelease(), 100);
                    }
                    return null;
                });
            }
        });


        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);

    const handleAnswer = async () => {
        if (!incomingCall || setupStarted.current) return;
        setupStarted.current = true;
        setIsAnswering(true);

        try {
            pc.current = new RTCPeerConnection(servers);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: incomingCall.mode === "video"
            });

            setLocalStream(stream);

            stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
            pc.current.ontrack = (event) => {
                console.log("Remote track received:", event.track.kind);
                const newStream = event.streams[0] || new MediaStream([event.track]);
                setRemoteStream(newStream);
                
                // Force any existing video element to update
                const videoEl = document.querySelector('video[autoplay]:not([muted])') as HTMLVideoElement;
                if (videoEl) {
                    videoEl.srcObject = newStream;
                    videoEl.play().catch(e => console.log("Auto-play nudge needed"));
                }
            };



            const pcCurrent = pc.current;
            pcCurrent.onicecandidate = (event) => {
                if (event.candidate) {
                    addDoc(collection(db, "calls", incomingCall.id, "calleeCandidates"), event.candidate.toJSON());
                }
            };

            const offerDescription = new RTCSessionDescription(incomingCall.offer);
            if (incomingCall.offer?.type && pcCurrent.signalingState === "stable") {
                await pcCurrent.setRemoteDescription(offerDescription);
            }

            const answerDescription = await pcCurrent.createAnswer();
            await pcCurrent.setLocalDescription(answerDescription);

            const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
            await updateDoc(doc(db, "calls", incomingCall.id), { answer, status: "connected" });

            onSnapshot(collection(db, "calls", incomingCall.id, "callerCandidates"), (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added" && pcCurrent) {
                        try {
                            pcCurrent.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                        } catch (e) {}
                    }
                });
            });
        } catch (err) {
            console.error("Answer failed:", err);
            handleDecline();
        }
    };

    const handleDecline = async () => {
        if (incomingCall) {
            try { await updateDoc(doc(db, "calls", incomingCall.id), { status: "ended" }); } catch (e) {}
        }
        forceRelease();
    };

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isLoudspeaker, setIsLoudspeaker] = useState(true);
    const ringtoneObj = useRef<HTMLAudioElement | null>(null);


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


    const toggleSpeaker = async () => {
        const audio = remoteVideoRef.current;
        if (!audio) return;
        setIsLoudspeaker(!isLoudspeaker);
    };

    useEffect(() => {
        if (!ringtoneObj.current) {
            ringtoneObj.current = new Audio("https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3");
            ringtoneObj.current.loop = true;
            ringtoneObj.current.volume = 0.5;
        }

        if (incomingCall && !isAnswering) {
            ringtoneObj.current.play().catch(e => console.log("Audio play blocked"));
        } else {
            ringtoneObj.current.pause();
            ringtoneObj.current.currentTime = 0;
        }

        return () => {
            ringtoneObj.current?.pause();
        };
    }, [incomingCall, isAnswering]);


    return (
        <AnimatePresence mode="wait">
            {incomingCall && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 sm:p-20 overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/90 backdrop-blur-3xl" />



                    
                    {!isAnswering ? (
                        <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-primary/30 rounded-[56px] p-12 w-full max-w-xl text-center shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                            <div className="w-40 h-40 bg-primary/10 rounded-[48px] flex items-center justify-center text-primary mx-auto mb-10 border border-primary/20 animate-pulse relative">
                                {incomingCall.mode === "video" ? <Video className="w-16 h-16" /> : <Phone className="w-16 h-16" />}
                                <div className="absolute -inset-4 border-2 border-emerald-500/10 rounded-[56px] animate-[ping_3s_infinite]"></div>
                            </div>
                            <h2 className="text-4xl font-black text-foreground italic uppercase tracking-tighter mb-4">Neural {incomingCall.mode === "video" ? "Video" : "Incoming"}</h2>
                            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mb-16">Secure Transmission Request Detected</p>
                            
                            <div className="flex gap-8 justify-center">
                                <Button onClick={handleDecline} variant="destructive" className="w-24 h-24 rounded-3xl bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-500/20 border-2 border-border transition-all hover:scale-105">
                                    <PhoneOff className="w-10 h-10" />
                                </Button>
                                <Button onClick={handleAnswer} className="w-24 h-24 rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 border-2 border-border transition-all hover:scale-110">
                                    <Check className="w-12 h-12" />
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full max-w-6xl aspect-video bg-background rounded-[56px] overflow-hidden border border-border shadow-3xl flex flex-col items-center justify-center">
                            {incomingCall.mode === "video" ? (
                                <>
                                    {remoteStream ? (
                                        <video 
                                            ref={(el) => {
                                                if (el && remoteStream) el.srcObject = remoteStream;
                                            }} 
                                            autoPlay 
                                            playsInline 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary font-bold uppercase tracking-[0.5em] animate-pulse">Syncing Video Node...</div>
                                    )}
                                    
                                    {localStream && (
                                        <div className="absolute bottom-10 right-10 w-48 sm:w-80 aspect-video bg-card rounded-3xl border-2 border-primary/30 overflow-hidden shadow-2xl z-20">
                                            <video 
                                                ref={(el) => {
                                                    if (el && localStream) el.srcObject = localStream;
                                                }} 
                                                autoPlay 
                                                muted 
                                                playsInline 
                                                className="w-full h-full object-cover scale-x-[-1]" 
                                            />
                                        </div>
                                    )}

                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-48 h-48 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mb-8 animate-pulse relative">
                                        <Phone className="w-24 h-24 text-primary" />
                                        <div className="absolute -inset-4 border-2 border-emerald-500/10 rounded-full animate-ping"></div>
                                    </div>
                                    <h2 className="text-5xl font-black text-foreground italic uppercase tracking-tighter mb-4">Neural Signal Active</h2>
                                    <p className="text-primary font-bold uppercase tracking-[0.4em] text-xs animate-pulse">Bilateral Communication Channel :: Secured</p>
                                    <audio 
                                        ref={(el) => {
                                            if (el && remoteStream) el.srcObject = remoteStream;
                                        }} 
                                        autoPlay 
                                        playsInline 
                                    />

                                </div>
                            )}

                            <div className="absolute bottom-12 inset-x-0 flex justify-center items-center gap-6 sm:gap-10 z-30">
                                <Button 
                                    onClick={toggleMic}
                                    className={`w-16 h-16 rounded-full border-2 transition-all ${isMuted ? "bg-red-500 border-red-500 text-foreground" : "bg-card border-white/10 text-muted-foreground"}`}
                                >
                                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                </Button>
                                <Button onClick={handleDecline} className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 border-8 border-slate-950 text-foreground shadow-2xl transition-all hover:scale-110">
                                    <PhoneOff className="w-10 h-10" />
                                </Button>
                                <Button 
                                    onClick={toggleSpeaker}
                                    className={`w-16 h-16 rounded-full border-2 transition-all ${isLoudspeaker ? "bg-primary/20 border-primary/50 text-primary" : "bg-card border-white/10 text-muted-foreground"}`}
                                >
                                    {isLoudspeaker ? <Volume2 className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                                </Button>
                                {incomingCall.mode === "video" && (
                                    <Button 
                                        onClick={toggleVideo}
                                        className={`w-16 h-16 rounded-full border-2 transition-all ${isVideoOff ? "bg-red-500 border-red-500 text-foreground" : "bg-card border-white/10 text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                                    </Button>
                                )}
                            </div>

                        </motion.div>
                    )}
                </div>
            )}
        </AnimatePresence>



    );
}
