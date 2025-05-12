import { useState, useCallback } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import Image from "next/image";
import { useCustomToast } from "../ui/custom-toast";
import { Trash2, Upload } from "lucide-react";

interface ImageUploaderProps {
  image: string | null;
  setImage: (image: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ image, setImage }) => {
  const [loading, setLoading] = useState(false);
  const toast = useCustomToast();
  const [dragActive, setDragActive] = useState(false);

  const uploadToLighthouse = async (file: File) => {
    // Reset any previous state
    setLoading(true);

    // Dismiss any existing toasts first
    toast.dismissAll();

    // Create a unique ID for this upload toast
    const uploadingToastId = `uploading-image-${Date.now()}`;

    // Show loading toast
    toast.loading("Uploading your image...", {
      id: uploadingToastId,
      description: "Please wait while we upload your profile image",
      duration: 0, // Don't auto-dismiss
    });

    try {
      const filesArray = [file];
      const { data } = await lighthouse.upload(
        filesArray,
        process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY as string
      );
      const uploadedImageUrl = `${data.Hash}`;
      setImage(uploadedImageUrl);

      // Dismiss loading toast and show success
      toast.dismiss(uploadingToastId);
      toast.success("Your profile image has been uploaded successfully", {
        description: "Image uploaded",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading file:", error);

      // Dismiss loading toast and show error
      toast.dismiss(uploadingToastId);
      toast.error("There was a problem uploading your image", {
        description: "Upload failed",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadToLighthouse(e.target.files[0]);
      // Reset the file input value so it can be reused
      e.target.value = "";
    }
  };

  // Handle drag events
  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [] // No dependencies needed as this function only uses setState
  );

  // Handle drop event
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        // Check if file is an image
        if (!file.type.match("image.*")) {
          toast.error("Please upload an image file (jpg, png, webp)", {
            description: "Invalid file type",
          });
          return;
        }
        await uploadToLighthouse(file);

        // Reset the file input to ensure it can be reused
        const fileInput = document.getElementById(
          "imageUploadInput"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      }
    },
    [toast, uploadToLighthouse] // Include uploadToLighthouse as it's used in the callback
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-black">
      <div
        onClick={() => document.getElementById("imageUploadInput")?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full cursor-pointer ${dragActive ? "bg-gray-50" : ""}`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2 py-8">
            <svg
              className="w-5 h-5 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Uploading...</span>
          </div>
        ) : image ? (
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            <Image
              src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${image}`}
              alt="Uploaded meme"
              fill
              className="object-contain"
            />
            <button
              className="absolute top-2 right-2 p-1 bg-white rounded-full border-2 cursor-pointer border-black"
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="mb-2 text-gray-600">
              Drag and drop your meme image here
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>
      <input
        type="file"
        id="imageUploadInput"
        accept="image/jpeg,image/jpg,image/webp,image/png,image/gif"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default ImageUploader;
