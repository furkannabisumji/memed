import { useState, useCallback } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import lighthouse from "@lighthouse-web3/sdk";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ image, setImage }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadToLighthouse = async (file: File) => {
    setLoading(true);
    // Show loading toast
    const uploadingToast = toast.loading("Uploading your image...", {
      description: "Please wait while we upload your profile image"
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
      toast.dismiss(uploadingToast);
      toast.success("Your profile image has been uploaded successfully", {
        description: "Image uploaded"
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Dismiss loading toast and show error
      toast.dismiss(uploadingToast);
      toast.error("There was a problem uploading your image", {
        description: "Upload failed"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadToLighthouse(e.target.files[0]);
    }
  };
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  // Handle drop event
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Check if file is an image
      if (!file.type.match('image.*')) {
        toast.error("Please upload an image file (jpg, png, webp)", {
          description: "Invalid file type"
        });
        return;
      }
      await uploadToLighthouse(file);
    }
  }, [toast]);

  return (
    <div className="flex flex-col items-center h-72 w-full max-w-sm relative">
      <div
        onClick={() => document.getElementById("imageUploadInput")?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`absolute inset-0 z-50 w-full flex justify-center items-center
          border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
          ${
            image
              ? "border-transparent"
              : dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-400 hover:border-gray-500"
          }`}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 animate-spin text-blue-500"
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
        ) : (
          !image && (
            <div className="h-full rounded-xl w-full bg-green-200 flex items-center relative justify-center">
              <div className="text-gray-600 flex flex-col items-center gap-2 absolute">
                <FiUploadCloud size={24} />
                <p className="text-center">
                  <span className="font-medium">Click to upload</span> or drag and drop
                  <br />
                  <span className="text-xs text-gray-500">JPG, PNG, or WebP</span>
                </p>
              </div>
              <FaUser size={200} className="text-green-500" />
            </div>
          )
        )}
      </div>
      <input
        type="file"
        id="imageUploadInput"
        accept="image/jpeg,image/jpg,image/webp,image/png"
        className="hidden"
        onChange={handleImageUpload}
      />
      {image && (
        <div className="relative w-full h-full">
          <Image
            src={`${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${image}`}
            alt="Uploaded"
            priority={true}
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
