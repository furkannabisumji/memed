import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface MemeSupportersProps {
  profile: any;
}

const MemeSupporters = ({ profile }: MemeSupportersProps) => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Top Supporters
        </h3>
        <p className="text-gray-500">
          These supporters hold the most {profile.tokenSymbol} tokens and
          receive priority rewards during minting events.
        </p>
      </div>

      {/* Mock data for supporters */}
      {(() => {
        const supporters = [
          {
            id: "1",
            name: "Elon Musk",
            handle: "elonmusk",
            profileImage: "/profile1.jpg",
            isVerified: true,
            tokens: 4500000,
          },
          {
            id: "2",
            name: "Vitalik Buterin",
            handle: "vitalik",
            profileImage: "/profile2.jpg",
            isVerified: true,
            tokens: 3200000,
          },
          {
            id: "3",
            name: "CryptoKitty",
            handle: "cryptokitty",
            profileImage: "/profile3.jpg",
            isVerified: false,
            tokens: 2100000,
          },
          {
            id: "4",
            name: "Meme Lord",
            handle: "memelord",
            profileImage: "/profile4.jpg",
            isVerified: false,
            tokens: 1800000,
          },
          {
            id: "5",
            name: "Web3 Wizard",
            handle: "web3wizard",
            profileImage: "/profile5.jpg",
            isVerified: true,
            tokens: 1500000,
          },
          {
            id: "6",
            name: "Degen Trader",
            handle: "degentrader",
            profileImage: "/profile6.jpg",
            isVerified: false,
            tokens: 950000,
          },
        ];

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supporters.map((supporter) => (
              <Card
                key={supporter.id}
                className="border-2 border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={supporter.profileImage} />
                      <AvatarFallback>
                        {supporter.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{supporter.name}</p>
                        {supporter.isVerified && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        @{supporter.handle}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tokens Held:</span>
                    <span className="font-bold text-primary">
                      {supporter.tokens.toLocaleString()} ${profile.tokenSymbol}
                    </span>
                  </div>
                  <Progress
                    value={(supporter.tokens / 5000000) * 100}
                    className="h-1.5 mt-1"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })()}
    </>
  );
};

export default MemeSupporters;
