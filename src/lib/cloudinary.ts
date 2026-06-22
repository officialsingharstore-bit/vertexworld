/**
 * Cloudinary Utility
 * This utility handles media uploads to Cloudinary using their unsigned upload preset.
 * You must provide NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and a public upload preset in your .env
 */

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dvx1m2mzn";
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "vertex_world_posts";

export async function uploadToCloudinary(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error("Cloudinary Upload Error:", error);
        throw new Error(error.error?.message || "Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
}

export async function uploadVideoToCloudinary(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error("Cloudinary Video Upload Error:", error);
        throw new Error(error.error?.message || "Failed to upload video to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
}
