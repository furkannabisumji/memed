import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap } from "lucide-react";
import { CreatorResponse } from "@/hooks/useCreators";
import { getAccountByUsername } from "@/lib/lens";
import { Account } from "@/app/types";

interface CreatorCardProps {
  creator: CreatorResponse;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserAccount() {
      try {
        setLoading(true);
        const result = (await getAccountByUsername(
          creator.handle
        )) as Account | null;
        setAccount(result);
      } catch (error) {
        console.error("Error fetching account:", error);
      } finally {
        setLoading(false);
      }
    }
    getUserAccount();
  }, [creator.handle]);

  // Helper function to get profile picture
  const getProfilePicture = () => {
    if (!account?.metadata?.picture) return null;

    if (typeof account.metadata.picture === "string") {
      return account.metadata.picture;
    }

    return (
      account.metadata.picture.optimized?.url ||
      account.metadata.picture.original?.url ||
      account.metadata.picture.uri
    );
  };

  // Helper to format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const profilePicture = getProfilePicture();

  return (
    <div className="relative overflow-hidden rounded-lg transition-all duration-300 bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-black">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={
                    profilePicture ||
                    `${process.env.NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY}${creator.tokens[0]?.image}`
                  }
                  alt={creator.handle}
                />
                <AvatarFallback className="bg-primary text-white font-bold">
                  {creator.handle.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">{creator.handle}</h2>
              <p className="text-sm text-gray-600">
                {formatAddress(creator.address)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 px-3 py-1 text-white bg-primary rounded-full">
              <Zap size={14} />
              <span className="font-medium">{creator.tokens.length} </span>
            </div>
            {account?.score && (
              <div className="mt-2 text-sm text-gray-600">
                Score:{" "}
                <span className="font-medium text-primary">
                  {account.score}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
