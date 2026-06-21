"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Mic, 
  CheckCheck, 
  MoreHorizontal,
  Phone,
  Video,
  Image as ImageIcon,
  File,
  X,
  Play,
  Pause,
  Download,
  AlertCircle,
  PhoneCall,
  VideoOff,
  Trash2,
  User,
  History,
  ChevronLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import WebRTCCall from "./WebRTCCall";
import { useAuth } from "@/hooks/useAuth";

interface ChatWindowProps {
  activeContact: any;
  messages: any[];
  onSendMessage: (text: string, type?: string) => void;
  onDeleteMessage?: (messageId: string, forEveryone: boolean) => void;
  onClearChat?: () => void;
  onArchiveChat?: () => void;
  onBlockUser?: () => void;
  isBlocked?: boolean;
  onBack?: () => void;
}


export default function ChatWindow({ 
  activeContact, 
  messages, 
  onSendMessage, 
  onDeleteMessage,
  onClearChat,
  onArchiveChat,
  onBlockUser,
  isBlocked,
  onBack
}: ChatWindowProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCallModal, setShowCallModal] = useState<"voice" | "video" | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);


  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  
  // Ref to always have the latest onSendMessage
  const onSendMessageRef = useRef(onSendMessage);
  useEffect(() => {
    onSendMessageRef.current = onSendMessage;
  }, [onSendMessage]);


  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (isRecording) {

      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    onSendMessageRef.current(messageInput, "text");
    setMessageInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1MB Limit for Firestore Document Size
    if (file.size > 1024 * 1024) {
        alert("File too large for direct neural transmission. Limit: 1MB.");
        return;
    }

    setIsUploading(true);
    try {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            const type = file.type.startsWith("image/") ? "image" : "file";
            
            if (isMounted.current) {
                onSendMessageRef.current(base64Data, type);
            }
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.onerror = () => {
            alert("Local memory read failed.");
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    } catch (err: any) {
        console.error("Local read error:", err);
        setIsUploading(false);
    }
  };



  // ── REFINED VOICE LOGIC (TOGGLE) ──
  const toggleRecording = async () => {
    if (isRecording) {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Data = event.target?.result as string;
                    onSendMessageRef.current(base64Data, "voice");
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };


            recorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access blocked.");
        }
    }
  };

  // ── CALL SIGNAL LOGIC ──
  const initiateCall = (type: "voice" | "video") => {
    setShowCallModal(type);
    onSendMessageRef.current(`[Signal] Initiating ${type} call...`, "signal");
  };

  const toggleVoicePlayer = (id: string) => {
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    if (!audio) return;

    if (playingVoiceId === id) {
        audio.pause();
        setPlayingVoiceId(null);
    } else {
        // Stop any currently playing audio
        if (playingVoiceId) {
            const currentAudio = document.getElementById(`audio-${playingVoiceId}`) as HTMLAudioElement;
            if (currentAudio) currentAudio.pause();
        }
        audio.play();
        setPlayingVoiceId(id);
        
        audio.onended = () => setPlayingVoiceId(null);
    }
  };

  const downloadMedia = (dataUrl: string, filename: string = "transmission_artifact") => {

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-160px)] h-[85vh] bg-card border border-border rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-3xl relative">
      {/* Image Lightbox (WhatsApp Style) */}
      <AnimatePresence>
        {selectedImage && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 sm:p-20"
                onClick={() => setSelectedImage(null)}
            >
                <button 
                  className="absolute top-10 right-10 p-4 text-foreground hover:text-primary transition-colors bg-white/5 rounded-2xl border border-white/10"
                  onClick={() => setSelectedImage(null)}
                >
                    <X className="w-8 h-8" />
                </button>
                <div className="absolute top-10 left-10 flex gap-4">
                    <button 
                      className="p-4 text-foreground hover:text-primary transition-colors bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2 font-black uppercase italic tracking-tighter"
                      onClick={(e) => { e.stopPropagation(); downloadMedia(selectedImage, "nexus_artifact.png"); }}
                    >
                        <Download className="w-6 h-6" /> Save
                    </button>
                </div>
                <motion.img 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    src={selectedImage} 
                    className="max-w-full max-h-full rounded-2xl shadow-3xl object-contain border border-white/10" 
                    onClick={(e) => e.stopPropagation()}
                />
                <div className="mt-8 text-center">
                    <p className="text-muted-foreground font-black uppercase tracking-[0.5em] text-xs">Strategic Data Node :: Secure View</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Real Neural Link Call */}

      <AnimatePresence>
        {showCallModal && (
            <WebRTCCall 
                mode={showCallModal}
                callerId={user?.uid || "unknown"} 
                calleeId={activeContact.id} 
                calleeName={activeContact.name}
                onClose={() => setShowCallModal(null)}
            />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 lg:p-8 bg-background/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-6">
            {onBack && (
                <button 
                    onClick={onBack}
                    className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}
            <div className="relative">
                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-card rounded-2xl lg:rounded-3xl border border-border flex items-center justify-center font-black text-primary text-lg lg:text-2xl italic">
                    {activeContact.initials}
                </div>
                {activeContact.online && <div className="absolute -bottom-0.5 -right-0.5 lg:-bottom-1 lg:-right-1 w-3 h-3 lg:w-5 lg:h-5 bg-primary rounded-full border-2 lg:border-4 border-background"></div>}
            </div>
            <div>
                <h3 className="text-base lg:text-2xl font-black text-foreground italic uppercase tracking-tighter mb-0.5 lg:mb-1">{activeContact.name}</h3>
                <p className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${activeContact.online ? "text-primary" : "text-muted-foreground"}`}>
                    {activeContact.online ? "Active Channel" : "Offline Node"}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => initiateCall("voice")} className="p-2 lg:p-4 text-muted-foreground hover:text-primary bg-background rounded-xl lg:rounded-2xl border border-border transition-all"><Phone className="w-4 h-4 lg:w-6 lg:h-6" /></button>
            <button onClick={() => initiateCall("video")} className="p-2 lg:p-4 text-muted-foreground hover:text-primary bg-background rounded-xl lg:rounded-2xl border border-border transition-all"><Video className="w-4 h-4 lg:w-6 lg:h-6" /></button>
            
            <div className="relative">
                <button 
                    onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                    className={`p-2 lg:p-4 transition-all rounded-xl lg:rounded-2xl border border-transparent ${showHeaderMenu ? "bg-muted text-foreground border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <MoreHorizontal className="w-4 h-4 lg:w-6 lg:h-6" />
                </button>

                <AnimatePresence>
                    {showHeaderMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowHeaderMenu(false)} />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 mt-4 w-64 bg-card border border-border rounded-[2rem] p-4 shadow-3xl z-50 overflow-hidden"
                            >
                                <div className="space-y-2">
                                    {[
                                        { name: "Clear Channel", icon: <Trash2 className="w-4 h-4" />, color: "hover:bg-red-500/10 hover:text-red-500" },
                                        { name: "Archive Node", icon: <History className="w-4 h-4" />, color: "hover:bg-primary/10 hover:text-primary" },
                                        { name: "Neural Profile", icon: <User className="w-4 h-4" />, color: "hover:bg-primary/10 hover:text-primary" },
                                        { name: isBlocked ? "Unblock Link" : "Block Link", icon: <VideoOff className="w-4 h-4" />, color: isBlocked ? "hover:bg-primary/10 hover:text-primary" : "hover:bg-red-500/10 hover:text-red-500" },
                                    ].map((opt) => (
                                        <button 
                                            key={opt.name}
                                            onClick={() => {
                                                if (opt.name === "Clear Channel") onClearChat?.();
                                                if (opt.name === "Archive Node") onArchiveChat?.();
                                                if (opt.name.toLowerCase().includes("block link")) onBlockUser?.();
                                                if (opt.name === "Neural Profile") alert("Redirecting to Neural Profile Node...");
                                                setShowHeaderMenu(false);
                                            }}
                                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-muted-foreground ${opt.color}`}
                                        >
                                            <span className="shrink-0">{opt.icon}</span>
                                            {opt.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-12 space-y-8 lg:space-y-12 bg-background/30 scrollbar-hide">
        {messages.map((m) => (
            <div key={m.id} className={`flex ${m.isSender ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] lg:max-w-[75%] ${m.isSender ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`shadow-xl lg:shadow-2xl ${
                        m.isSender ? "bg-primary text-primary-foreground rounded-2xl lg:rounded-[32px] rounded-tr-none px-4 py-3 lg:px-6 lg:py-4" : "bg-muted text-foreground rounded-2xl lg:rounded-[32px] rounded-tl-none border border-border px-4 py-3 lg:px-6 lg:py-4"
                    }`}>
                        {m.type === "image" ? (
                            <div className="relative group/img">
                                <img 
                                    src={m.text} 
                                    alt="Data" 
                                    onClick={() => setSelectedImage(m.text)}
                                    className="rounded-2xl max-h-[400px] w-full object-cover shadow-2xl cursor-zoom-in transition-transform hover:scale-[1.01]" 
                                />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => downloadMedia(m.text)}
                                        className="p-3 bg-black/60 backdrop-blur-xl text-foreground rounded-xl border border-white/10 hover:text-primary"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : m.type === "voice" ? (
                            <div className="flex items-center gap-4 min-w-[240px] group/voice">
                                <button 
                                    onClick={() => toggleVoicePlayer(m.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                        playingVoiceId === m.id 
                                        ? "bg-primary text-primary-foreground animate-pulse" 
                                        : m.isSender ? "bg-background text-primary" : "bg-primary text-primary-foreground"
                                    }`}
                                >
                                    {playingVoiceId === m.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current lg:translate-x-0.5" />}
                                </button>
                                <div className="flex-1">
                                    <div className={`h-1.5 rounded-full overflow-hidden ${m.isSender ? "bg-black/20" : "bg-primary/20"}`}>
                                        <div className={`h-full bg-current rounded-full transition-all duration-300 ${playingVoiceId === m.id ? "w-full" : "w-1/4"}`}></div>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-60 italic">
                                        {playingVoiceId === m.id ? "Streaming Voice Node..." : "Voice Transmission Node"}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover/voice:opacity-100 transition-opacity">
                                    <button onClick={() => downloadMedia(m.text, "voice_log.webm")} className="p-2 text-muted-foreground hover:text-primary"><Download className="w-4 h-4" /></button>
                                </div>
                                <audio id={`audio-${m.id}`} src={m.text} className="hidden" />
                            </div>

                        ) : m.type === "file" ? (
                            <div className="flex items-center gap-4 group/file">
                                <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center"><Download className="w-6 h-6" /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold truncate max-w-[150px]">Secure Artifact</p>
                                    <a href={m.text} target="_blank" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Open Source</a>
                                </div>
                                <button onClick={() => downloadMedia(m.text)} className="opacity-0 group-hover/file:opacity-100 p-2 text-muted-foreground hover:text-primary transition-opacity"><Download className="w-5 h-5" /></button>
                            </div>
                        ) : m.type === "signal" ? (
                            <div className="flex items-center gap-3 italic opacity-80">
                                <AlertCircle className="w-4 h-4" />
                                <p className="text-xs font-black uppercase tracking-tighter">{m.text}</p>
                            </div>
                        ) : (
                            <div className="group/text flex flex-col gap-2">
                                <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">{m.time}</span>
                            {m.isSender && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div className="flex items-center gap-3 border-l border-border pl-4">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(m.text);
                                    alert("Signal copied to clipboard. You can now forward it.");
                                }}
                                className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary"
                            >Forward</button>
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({ text: m.text }).catch(() => {});
                                    } else {
                                        navigator.clipboard.writeText(m.text);
                                        alert("Neural link copied.");
                                    }
                                }}
                                className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary"
                            >Share</button>
                            <div className="relative">
                                <button 
                                    onClick={() => setDeleteMenuId(deleteMenuId === m.id ? null : m.id)}
                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <AnimatePresence>
                                    {deleteMenuId === m.id && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className={`absolute bottom-full mb-2 z-50 bg-card border border-white/10 rounded-2xl p-2 shadow-3xl min-w-[140px] ${m.isSender ? "right-0" : "left-0"}`}
                                        >
                                            <button 
                                                onClick={() => { onDeleteMessage?.(m.id, false); setDeleteMenuId(null); }}
                                                className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                            >Delete for me</button>
                                            {m.isSender && (
                                                <button 
                                                    onClick={() => { onDeleteMessage?.(m.id, true); setDeleteMenuId(null); }}
                                                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500"
                                                >Delete for everyone</button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-8 bg-card border-t border-border backdrop-blur-xl">
        <div className={`flex items-center gap-2 lg:gap-4 bg-background border rounded-2xl lg:rounded-[32px] p-2 pl-4 lg:pl-8 shadow-2xl transition-all ${isRecording ? "border-red-500/50 shadow-red-500/5" : "border-border focus-within:border-primary/30"}`}>
            {isRecording ? (
                <div className="flex-1 flex items-center gap-4 px-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-black text-foreground italic uppercase tracking-[0.2em]">Capturing Neural Stream... 0:{recordingTime.toString().padStart(2, '0')}</span>
                </div>
            ) : (
                <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none outline-none text-foreground text-sm lg:text-base py-3 lg:py-4 placeholder:text-muted-foreground italic font-medium"
                />
            )}
            
            <div className="flex items-center gap-1">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-muted-foreground hover:text-primary transition-colors"
                >
                    <Paperclip className="w-6 h-6" />
                </button>
                <button 
                  onClick={toggleRecording}
                  className={`p-3 transition-all ${isRecording ? "text-red-500 scale-125" : "text-muted-foreground hover:text-primary"}`}
                >
                    <Mic className="w-6 h-6" />
                </button>
                <Button 
                    onClick={handleSend}
                    disabled={isUploading}
                    className="w-12 h-12 lg:w-16 lg:h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl lg:rounded-2xl flex items-center justify-center p-0 shadow-xl transition-all hover:scale-105"
                >
                    <Send className="w-5 h-5 lg:w-6 lg:h-6 lg:translate-x-0.5" />
                </Button>
            </div>
        </div>
        {isUploading && (
            <div className="mt-4 flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest animate-pulse ml-6">
                <AlertCircle className="w-3 h-3" /> Transmitting Data Node to Cloud...
            </div>
        )}
      </div>
    </div>
  );
}
