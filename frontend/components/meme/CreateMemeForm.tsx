import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ChevronRight, Trash2, Upload } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
export default function CreateMemeForm({
  memeImage,
  setMemeImage,
  handlePrevStep,
  handleNextStep,
}: {
  memeImage: string | null;
  setMemeImage: Dispatch<SetStateAction<string | null>>;
  handlePrevStep: () => void;
  handleNextStep: () => void;
}) {
  return (
    <div className="p-8 border-2 border-black">
      <h1 className="mb-6 text-4xl font-black text-black">Create Your Meme</h1>
      <p className="mb-8 text-lg text-gray-600">
        Upload an image, choose from templates, or generate a meme using AI.
      </p>

      <div className="grid gap-8 mb-8 md:grid-cols-2">
        <div>
          <div className="mb-6">
            <Label htmlFor="meme-title" className="mb-2 text-lg font-bold">
              Meme Title
            </Label>
            <Input
              id="meme-title"
              placeholder="Enter a catchy title..."
              className="border-2 border-black"
            />
          </div>

          <div className="mb-6">
            <Label
              htmlFor="meme-description"
              className="mb-2 text-lg font-bold"
            >
              Description
            </Label>
            <Textarea
              id="meme-description"
              placeholder="Tell the story behind your meme..."
              className="min-h-[100px] border-2 border-black"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col items-center justify-center p-6 mb-6 border-2 border-dashed border-black">
            {memeImage ? (
              <div className="relative w-full aspect-square max-w-xs mx-auto">
                <Image
                  src={memeImage || "/placeholder.svg"}
                  alt="Uploaded meme"
                  fill
                  className="object-contain"
                />
                <button
                  className="absolute top-2 right-2 p-1 bg-white rounded-full border-2 cursor-pointer border-black"
                  onClick={() => setMemeImage(null)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
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
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="border-2 border-black text-black hover:bg-black hover:text-white cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={handleNextStep}
          className="gap-2 bg-primary hover:shadow-2xl hover:bg-primary/90 cursor-pointer"
          // disabled={!memeImage}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
