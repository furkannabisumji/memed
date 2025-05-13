import { useState } from "react";
import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCustomToast } from "@/components/ui/custom-toast";

interface MirrorModalProps {
  engagementReward: number;
  profile: any;
  onClose?: () => void;
}

const MirrorModal = ({ engagementReward, profile, onClose }: MirrorModalProps) => {
  const [mirrorText, setMirrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useCustomToast();

  const handleSubmitMirror = () => {
    // Optional: Allow empty mirrors (pure repost) or require text
    // if (!mirrorText.trim()) {
    //   toast.error("Mirror text required", {
    //     description: "Please add some text to your mirror"
    //   });
    //   return;
    // }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Meme mirrored", {
        description: `You earned ${engagementReward} ${profile.tokenSymbol} tokens!`
      });
      setIsSubmitting(false);
      setMirrorText("");
      if (onClose) onClose();
    }, 1000);
  };

  return (
    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Mirror this Meme
          <Badge className="bg-primary text-white">
            +{engagementReward} ${profile.tokenSymbol}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Share this meme with your followers. Add your thoughts or mirror as is.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-start gap-4 mt-4">
        <Avatar>
          <AvatarImage src={profile.profileImage} alt={profile.displayName} />
          <AvatarFallback>{profile.displayName.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-2">
            <span className="font-semibold">{profile.displayName}</span>
            <span className="text-gray-500 ml-2">@{profile.username}</span>
          </div>
          <Textarea
            placeholder="Add your thoughts (optional)"
            className="min-h-[100px] resize-none"
            value={mirrorText}
            onChange={(e) => setMirrorText(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.profileImage} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{profile.displayName}</div>
            <div className="text-sm text-gray-500">@{profile.username}</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          {profile.bio ? profile.bio.substring(0, 120) + "..." : "No bio available"}
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleSubmitMirror}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Mirroring..." : "Mirror"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default MirrorModal;
