import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import MemeImageUploader from "../shared/MemeImageUploader";
import { useCustomToast } from "../ui/custom-toast";
export default function CreateMemeForm({
  memeImage,
  setMemeImage,
  handlePrevStep,
  handleNextStep,
  memeTitle,
  setMemeTitle,
  memeDescription,
  setMemeDescription,
}: {
  memeImage: string | null;
  setMemeImage: Dispatch<SetStateAction<string | null>>;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  memeTitle: string;
  setMemeTitle: Dispatch<SetStateAction<string>>;
  memeDescription: string;
  setMemeDescription: Dispatch<SetStateAction<string>>;
}) {
  const toast = useCustomToast();

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
              value={memeTitle}
              onChange={(e) => setMemeTitle(e.target.value)}
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
              value={memeDescription}
              onChange={(e) => setMemeDescription(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="mb-6">
            <MemeImageUploader image={memeImage} setImage={setMemeImage} />
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
          onClick={() => {
            if (!memeImage || !memeTitle || !memeDescription) {
              toast.error("Please fill all fields");
              return;
            }
            handleNextStep();
            console.log(memeTitle, memeDescription, memeImage);
          }}
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
