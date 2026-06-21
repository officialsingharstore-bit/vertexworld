"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  Link as LinkIcon,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ProductEditorProps {
    productId?: string;
}

export default function ProductEditor({ productId }: ProductEditorProps) {
    const router = useRouter();
    const isEdit = !!productId;

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');
    const [linkInput, setLinkInput] = useState("");
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [howToUse, setHowToUse] = useState("");
    const [category, setCategory] = useState("Course");
    const [price, setPrice] = useState(0);
    const [images, setImages] = useState<string[]>([]);
    const [files, setFiles] = useState<{ name: string; url: string; size?: string }[]>([]);

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const snap = await getDoc(doc(db, "products", productId!));
            if (snap.exists()) {
                const data = snap.data();
                setTitle(data.title || "");
                setDescription(data.description || "");
                setHowToUse(data.howToUse || "");
                setCategory(data.category || "Course");
                setPrice(data.price || 0);
                setImages(data.images || []);
                setFiles(data.files || []);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = () => {
        if (!linkInput.trim()) return;
        let url = linkInput.trim();
        // Auto-convert Google Drive share links
        if (url.includes('drive.google.com/file')) {
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match?.[1]) {
                url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
        }
        setImages(prev => [...prev, url]);
        setLinkInput("");
    };

    const handleCloudinaryUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || cloudName === 'your_cloud_name') {
            alert('Cloudinary is not configured yet. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.');
            return;
        }
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;
            setUploadProgress(0);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', uploadPreset || 'vertex_unsigned');
                formData.append('folder', 'vertex_products');
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        setUploadProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };
                const result = await new Promise<any>((resolve, reject) => {
                    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
                    xhr.onerror = reject;
                    xhr.send(formData);
                });
                if (result.secure_url) {
                    setImages(prev => [...prev, result.secure_url]);
                } else {
                    alert('Upload failed: ' + (result.error?.message || 'Unknown error'));
                }
            } catch (err) {
                console.error('Cloudinary upload error:', err);
                alert('Upload failed. Check your Cloudinary settings.');
            } finally {
                setUploadProgress(null);
            }
        }
    };

    const handleAddFile = () => {
        const name = prompt("Enter File Name (e.g. Part 1):");
        const url = prompt("Enter Download URL:");
        const size = prompt("Enter File Size (e.g. 1.2 GB):");
        if (name && url) setFiles([...files, { name, url, size: size || "" }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        const payload = {
            title,
            description,
            howToUse,
            category,
            price: Number(price),
            isPaid: price > 0,
            images,
            files,
            updatedAt: serverTimestamp(),
            ...(isEdit ? {} : { createdAt: serverTimestamp() })
        };
// ... rest of the logic

        try {
            if (isEdit) {
                await updateDoc(doc(db, "products", productId!), payload);
            } else {
                await addDoc(collection(db, "products"), payload);
            }
            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            console.error("Save error:", err);
            alert("Execution failed. Sync error.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl">
            <div className="lg:col-span-2 space-y-8">
                {/* Basic Info */}
                <div className="bg-[#0a0f1d] border border-border rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <FileText className="w-24 h-24" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter mb-6">Asset Core Metadata</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Node Title</label>
                                <input 
                                    required 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter premium asset name..." 
                                    className="h-16 w-full bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:border-primary transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Logical Description</label>
                                <textarea 
                                    required 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5} 
                                    placeholder="Describe the value proposition of this node..." 
                                    className="w-full bg-background border border-border rounded-2xl p-6 text-foreground font-medium focus:border-primary transition-all outline-none resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Deployment Instructions (How to use)</label>
                                <textarea 
                                    value={howToUse}
                                    onChange={(e) => setHowToUse(e.target.value)}
                                    rows={3} 
                                    placeholder="Step-by-step guide for the end user..." 
                                    className="w-full bg-background border border-border rounded-2xl p-6 text-foreground font-medium focus:border-primary transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* File Management */}
                <div className="bg-[#0a0f1d] border border-border rounded-[40px] p-10 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Payload Synchronization</h2>
                        <Button type="button" onClick={handleAddFile} variant="outline" className="h-10 px-6 rounded-xl border-border hover:bg-primary hover:text-foreground text-[10px] font-black uppercase tracking-widest">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Part
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {files.length === 0 ? (
                            <div className="border border-dashed border-border rounded-3xl p-10 text-center text-muted-foreground/40 font-bold uppercase tracking-widest text-[10px]">
                                No file packets attached to this node.
                            </div>
                        ) : (
                            files.map((file, i) => (
                                        <div key={i} className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 italic font-black text-xs">P{i+1}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-foreground uppercase italic">{file.name}</p>
                                                        {file.size && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black italic">{file.size}</span>}
                                                    </div>
                                                    <p className="text-[9px] text-muted-foreground font-medium truncate max-w-[200px]">{file.url}</p>
                                                </div>
                                            </div>
                                    <Button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {/* Configuration */}
                <div className="bg-[#0a0f1d] border border-border rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                    <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Protocol Config</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Node Type</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-14 w-full bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:border-primary outline-none appearance-none cursor-pointer"
                            >
                                <option>Course</option>
                                <option>Theme</option>
                                <option>Plugin</option>
                                <option>App</option>
                                <option>Software</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Credit Value (USD)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary italic">$</span>
                                <input 
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    placeholder="0 for Open Node (FREE)" 
                                    className="h-14 w-full bg-background border border-border rounded-2xl pl-12 pr-6 text-foreground font-black focus:border-primary outline-none"
                                />
                            </div>
                            <p className="text-[9px] text-muted-foreground font-medium italic mt-2 opacity-60">* Setting to 0 enables global open-access protocol.</p>
                        </div>
                    </div>
                </div>

                {/* Visual Assets */}
                <div className="bg-[#0a0f1d] border border-border rounded-[40px] p-10 space-y-6 shadow-2xl">
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Visuals</h2>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-50">Add images via URL or direct upload</p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 bg-background/50 p-1.5 rounded-2xl border border-border">
                        <button
                            type="button"
                            onClick={() => setImageMode('link')}
                            className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                imageMode === 'link' ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <LinkIcon className="w-3 h-3" />
                            Paste Link
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageMode('upload')}
                            className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                imageMode === 'upload' ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Upload className="w-3 h-3" />
                            Cloudinary Upload
                        </button>
                    </div>

                    {/* Link Mode */}
                    {imageMode === 'link' && (
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                                    placeholder="https://i.imgur.com/your-image.jpg"
                                    className="flex-1 h-12 bg-background border border-border rounded-2xl px-5 text-foreground font-bold text-sm focus:border-primary outline-none placeholder:text-muted-foreground/30"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddLink}
                                    disabled={!linkInput.trim()}
                                    className="h-12 px-6 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-2xl hover:bg-primary/90 disabled:opacity-30"
                                >
                                    Add
                                </Button>
                            </div>
                            <p className="text-[8px] text-muted-foreground/50 font-black uppercase tracking-widest ml-2">Supported: Imgur, direct .jpg/.png/.webp links. Google Drive auto-converted.</p>
                        </div>
                    )}

                    {/* Cloudinary Upload Mode */}
                    {imageMode === 'upload' && (
                        <div className="space-y-4">
                            <div
                                className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); handleCloudinaryUpload(e.dataTransfer.files); }}
                            >
                                {uploadProgress !== null ? (
                                    <div className="space-y-3">
                                        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Uploading to Cloudinary... {uploadProgress}%</p>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all shadow-[0_0_8px_rgba(163,255,51,0.8)]"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Click or Drag & Drop</p>
                                        <p className="text-[8px] text-muted-foreground/40 mt-1 font-black uppercase tracking-widest">PNG · JPG · WEBP · GIF</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleCloudinaryUpload(e.target.files)}
                            />
                        </div>
                    )}

                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-primary/20 group bg-black/40 flex items-center justify-center">
                                    <img
                                        src={img}
                                        className="w-full h-full object-contain"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.classList.add('border-red-500/50');
                                        }}
                                    />
                                    <div className="absolute top-2 left-2 bg-primary/80 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-0.5">
                                        <CheckCircle2 className="w-2.5 h-2.5" />Saved
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                        className="absolute top-2 right-2 bg-black/80 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {images.length === 0 && uploadProgress === null && (
                        <div className="py-4 flex flex-col items-center justify-center text-muted-foreground/30 gap-2">
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-[9px] font-black uppercase tracking-widest">No images added yet</span>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="pt-6">
                    <Button 
                        disabled={submitting} 
                        className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/20 scale-100 active:scale-95 transition-all text-xl italic"
                    >
                        {submitting ? (
                            <Loader2 className="w-6 h-6 animate-spin mr-3" />
                        ) : (
                            <Save className="w-6 h-6 mr-3" />
                        )}
                        {isEdit ? "Update Protocol" : "Initialize Asset"}
                    </Button>
                    <Button 
                        type="button"
                        onClick={() => router.back()}
                        variant="ghost" 
                        className="w-full mt-4 h-12 text-muted-foreground font-bold uppercase tracking-widest text-[9px]"
                    >
                        Abort Modification
                    </Button>
                </div>
            </div>
        </form>
    );
}
