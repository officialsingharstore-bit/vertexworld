"use client";

import { useParams } from "next/navigation";
import ProductEditor from "../../editor";

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-5xl font-black text-foreground uppercase italic tracking-tighter mb-4">Protocol <span className="text-primary">Modification</span></h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em]">Updating asset node: <span className="text-foreground">{id}</span></p>
            </div>
            
            <ProductEditor productId={id} />
        </div>
    );
}
