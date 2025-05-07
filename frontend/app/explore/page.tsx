import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Search, TrendingUp } from "lucide-react"
import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import MemeCard from "@/components/meme/MemeCard"

export default function ExplorePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white md:mt-20">
        <div className="md:px-20 px-5 py-12 mx-auto">
          <h1 className="mb-8 md:text-6xl text-3xl font-bold text-black font-clash">Explore Memes</h1>

          <div className="flex flex-col gap-4 mb-8 md:flex-row">
            <div className="relative flex-1 justify-center item-center">
              <Search className="absolute top-[25%] left-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search memes, creators, or tokens..."
                className="pl-10 bg-white border-2 border-black"
              />
            </div>
            <Button variant="outline" className="gap-2 border-2 border-black text-black hover:bg-black hover:text-white ">
              <Filter size={16} />
              <span>Filters</span>
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 hover:shadow-2xl">
              <TrendingUp size={16} />
              <span>Trending</span>
            </Button>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="w-full h-auto p-0 bg-transparent border-b border-gray-200">
              <TabsTrigger
                value="all"
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary"
              >
                All Memes
              </TabsTrigger>
              <TabsTrigger
                value="tokens"
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary"
              >
                Tokens
              </TabsTrigger>
              <TabsTrigger
                value="creators"
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary"
              >
                Creators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {allMemes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="mt-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tokenMemes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="creators" className="mt-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {creatorMemes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
              </div>
            </TabsContent>

          </Tabs>

          <div className="flex justify-center mt-12">
            <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white">
              Load More
            </Button>
          </div>
        </div>

        <Footer />

      </main>
    </>
  )
}

const allMemes = [
  {
    id: 1,
    title: "Doge to the Moon",
    creator: "CryptoMemer",
    image: "/fallback.png",
    likes: 1452,
    price: 0.05,
    tokenSymbol: "DOGE",
  },
  {
    id: 2,
    title: "Pepe's Adventure",
    creator: "MemeKing",
    image: "/fallback.png",
    likes: 982,
    price: 0.03,
    tokenSymbol: "PEPE",
  },
  {
    id: 3,
    title: "Wojak's Feelings",
    creator: "EmotionMaster",
    image: "/fallback.png",
    likes: 753,
    price: 0.02,
    tokenSymbol: "WOJAK",
  },
  {
    id: 4,
    title: "Stonks Only Go Up",
    creator: "WallStreetBets",
    image: "/fallback.png",
    likes: 2104,
    price: 0.08,
    tokenSymbol: "STONK",
  },
  {
    id: 6,
    title: "This is Fine",
    creator: "FireMemer",
    image: "/fallback.png",
    likes: 1203,
    price: 0.06,
    tokenSymbol: "FINE",
  },
]

const tokenMemes = allMemes.filter((_, index) => index % 2 === 0)
const creatorMemes = allMemes.filter((_, index) => index % 3 === 0)