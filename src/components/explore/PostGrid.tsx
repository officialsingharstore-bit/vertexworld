"use client";

import PostCard from "./PostCard";

interface PostGridProps {
    posts: any[];
    loading?: boolean;
}

export default function PostGrid({ posts, loading }: PostGridProps) {
    if (loading) {
        return (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-card/50 border border-border rounded-3xl min-h-[300px] animate-pulse" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-20 text-center bg-card/20 border border-dashed border-border rounded-[48px]">
                <p className="text-muted-foreground font-black uppercase tracking-widest">No creative transmissions found in this node.</p>
            </div>
        );
    }

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {posts.map((post) => (
                <div key={post.id} className="break-inside-avoid">
                    <PostCard post={post} />
                </div>
            ))}
        </div>
    );
}
