"use client";

import ProductEditor from "../editor";

export default function NewProductPage() {
    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-5xl font-black text-foreground uppercase italic tracking-tighter mb-4">Node <span className="text-primary">Initialization</span></h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em]">Configure a new digital asset for the VertX network.</p>
            </div>
            
            <ProductEditor />
        </div>
    );
}
