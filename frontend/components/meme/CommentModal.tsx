import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useCustomToast } from "@/components/ui/custom-toast";
interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  profileImage: string;
  bannerImage: string;
  isVerified: boolean;
  isFollowing: boolean;
  isOwner: boolean;
  createdAt: string;
  creatorName: string;
  creatorHandle: string;
  creatorProfileImage: string;
  tokenSymbol: string;
  tokenPrice: string;
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  heatScore: number;
  likes: number;
  comments: number;
  mirrors: number;
  engagements: number;
  tokenRequirement: number;
}

interface CommentModalProps {
  engagementReward: number;
  profile: Profile;
}

export default function CommentModal({
  engagementReward,
  profile,
}: CommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const toast = useCustomToast();

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      toast.error("Comment required", {
        description: "Please enter a comment"
      });
      return;
    }

    setIsSubmittingComment(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmittingComment(false);
      setCommentText("");
      
      // Show success toast
      toast.success("Comment added", {
        description: `You earned ${engagementReward} ${profile.tokenSymbol} tokens!`,
      });
    }, 1000);
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add a Comment</DialogTitle>
          <DialogDescription>
            Comment on this meme to earn {engagementReward} $
            {profile.tokenSymbol} tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Existing Comments */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            <h4 className="font-medium text-sm text-gray-500">
              Recent Comments
            </h4>

            {/* Mock comments */}
            {[
              {
                id: 1,
                user: "CryptoWhale",
                avatar: "/fallback.png",
                text: "This meme is going to the moon! 🚀",
                time: "2 hours ago",
                likes: 24,
              },
              {
                id: 2,
                user: "TokenCollector",
                avatar: "/fallback.png",
                text: "Just bought 50k more tokens. This is the best meme of the year.",
                time: "5 hours ago",
                likes: 18,
              },
              {
                id: 3,
                user: "MemeExpert",
                avatar: "/fallback.png",
                text: "The tokenomics on this one are solid. Great engagement metrics too.",
                time: "1 day ago",
                likes: 42,
              },
              {
                id: 4,
                user: "DiamondHands",
                avatar: "/fallback.png",
                text: "HODL! Not selling until we reach 10x from here.",
                time: "2 days ago",
                likes: 31,
              },
            ].map((comment) => (
              <div key={comment.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>
                      {comment.user.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{comment.user}</p>
                    <p className="text-xs text-gray-500">{comment.time}</p>
                  </div>
                </div>
                <p className="text-sm mb-2">{comment.text}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <ThumbsUp size={12} className="mr-1" />
                    {comment.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <MessageCircle size={12} className="mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* New Comment Input */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-500 mb-2">
              Your Comment
            </h4>
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/fallback.png" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  className="w-full p-2 border rounded-md text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Share your thoughts about this meme..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Comments are stored on-chain and cannot be deleted.
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90 cursor-pointer"
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
  );
}
