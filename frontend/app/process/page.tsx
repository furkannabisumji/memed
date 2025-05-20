import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | Memed.fun",
  description:
    "Learn how Memed.fun creates a social-powered meme-token economy on Lens Protocol",
};

const features = [
  {
    title: "Meme = Profile",
    description:
      "Each meme is minted as its own Lens profile. A meme requires at least 50,000 followers to be eligible for launch and token minting.",
    icon: "🎭",
  },
  {
    title: "Launch & Token Minting",
    description:
      "1 billion meme tokens are minted per profile. 2% goes to the creator and 2% is airdropped to 5,000 random Lens followers.",
    icon: "🪙",
  },
  {
    title: "Token-Gated Following",
    description:
      "Hold 1,000 meme tokens to follow and support a meme. Drop below this amount and the follow is automatically revoked.",
    icon: "🔑",
  },
  {
    title: "Engage-to-Earn",
    description:
      "Earn meme tokens for engaging with content. Every 100,000 engagements mints 1% of supply for creators and 1% for random supporters.",
    icon: "💬",
  },
  {
    title: "Meme Battles",
    description:
      "Compete in Lens thread battles. Winners receive bonus token mints and increased visibility.",
    icon: "⚔️",
  },
  {
    title: "Staking = Belief",
    description:
      "Stake tokens on trending memes and earn rewards when they go viral from trading volume and engagements.",
    icon: "📈",
  },
];

export default function HowItWorks() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12 md:py-16 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
            How Memed.fun Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The social-powered meme-token platform where memes grow, mint
            tokens, and battle through engagement on Lens Protocol.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 h-full"
            >
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            The Memed.fun Journey
          </h2>
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create & Grow</h3>
                <p className="text-muted-foreground">
                  Launch your meme as a Lens profile and build your community.
                  Reach 50,000 followers to unlock token minting.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Mint & Distribute
                </h3>
                <p className="text-muted-foreground">
                  Mint 1 billion tokens. 2% goes to you, 2% is airdropped to
                  followers, and the rest powers the ecosystem.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Engage & Earn</h3>
                <p className="text-muted-foreground">
                  Earn tokens by engaging with content. Every 100,000
                  engagements mints 1% for creators and 1% for supporters.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Join the Meme Economy?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the future of social tokens and meme culture on Lens
            Protocol.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/launch">
              <Button size="lg" className="text-lg">
                Create Your Meme
              </Button>
            </Link>

            <Link href="/explore">
              <Button size="lg" variant="outline" className="text-lg">
                Explore Memes
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
