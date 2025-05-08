'use client'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Share, UserPlus } from "lucide-react"
import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"




export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Details")
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })
  const tabsListRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    all: null,
    tokens: null,
    creators: null,
  })

  // Function to update the underline position based on the active tab
  const updateUnderlinePosition = () => {
    const activeTabElement = tabRefs.current[activeTab]
    const tabsListElement = tabsListRef.current

    if (activeTabElement && tabsListElement) {
      const tabRect = activeTabElement.getBoundingClientRect()
      const listRect = tabsListElement.getBoundingClientRect()

      setUnderlineStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      })
    }
  }

  // Update underline position on window resize
  useEffect(() => {
    window.addEventListener("resize", updateUnderlinePosition)
    return () => {
      window.removeEventListener("resize", updateUnderlinePosition)
    }
  }, [])

  // Update underline position when active tab changes
  useEffect(() => {
    updateUnderlinePosition()
  }, [activeTab])
  const profile = {
    username: "MemeMaster",
    displayName: "Meme Master",
    bio: "Creating the dankest memes in the metaverse. Collector and creator of rare meme tokens.",
    followers: 1234,
    following: 567,
    profileImage: "/placeholder.svg?height=150&width=150",
    bannerImage: "/placeholder.svg?height=400&width=1200",
    isVerified: true,
    isFollowing: false,
    isOwner: false,
    createdMemes: allMemes.slice(0, 4),
    collectedMemes: allMemes.slice(4, 8),
    tokensMinted: 12,
  }

  return (
    <>
      <Header />
      <main className="min-h-screen mb-20">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={"/fallback.png"}
            alt="Profile banner"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container px-4 mx-auto -mt-20">
          <div className="relative z-10 p-6 bg-white rounded-xl dark:bg-gray-800 shadow-xl">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative">
                <Image
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.displayName}
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-[#28D358]"
                />
                {profile.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-primary text-white p-1 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-badge-check"
                    >
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col items-center gap-2 md:flex-row">
                  <h1 className="text-3xl font-bold">{profile.displayName}</h1>
                  <Badge variant="outline" className="border-[#28D358] text-[#28D358]">
                    @{profile.username}
                  </Badge>
                </div>

                <p className="mt-2 text-gray-600 dark:text-gray-300">{profile.bio}</p>

                <div className="flex flex-wrap justify-center gap-4 mt-4 md:justify-start">
                  <div className="text-center">
                    <div className="text-xl font-bold ">{profile.followers}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold ">{profile.tokensMinted}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tokens Minted</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {profile.isOwner ? (
                  <Button variant="outline" className="gap-2 border-purple-300 dark:border-purple-700">
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <Button className="gap-2 bg-gradient-to-r bg-primary hover:shadow-2xl cursor-pointer">
                    <UserPlus size={16} />
                    <span>{profile.isFollowing ? "Following" : "Follow"}</span>
                  </Button>
                )}
                <Button variant="outline" className="">
                  <Share size={16} />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-8 mt-10" onValueChange={setActiveTab} value={activeTab}>
              <div className="relative" ref={tabsListRef}>
                <TabsList className="w-full h-auto p-0 bg-transparent border-b border-gray-200">
                  {["Details", "Supporters"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="px-6 py-3 cursor-pointer hover:bg-secondary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:text-primary transition-colors"
                      ref={(el) => {
                        tabRefs.current[tab] = el
                      }}
                    >
                      {tab === "Details"
                        ? "Details"
                        : tab === "Supporters"
                          ? "Supporters" : ""
                      }
                    </TabsTrigger>
                  ))}
                </TabsList>
                {/* Sliding underline */}
                <div
                  className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-in-out"
                  style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width,
                  }}
                />
              </div>
              <TabsContent value="Details" className="mt-8">
                <div className="grid grid-cols-1">
                  <div className="grid grid-cols-1">
                    <Card className="border-1 shadow-none">
                      <CardContent className="p-6">
                        <div className="grid gap-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Token Symbol:</span>
                            <span className="">$DOGE</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Current Price:</span>
                            <span className="">0.01 ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Total Supply:</span>
                            <span className="">
                              1,000,000
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Holders:</span>
                            <span className="">1290</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <Button className="bg-primary hover:shadow-2xl">
                            Buy Token
                          </Button>
                          <Button variant="outline" className="hover:shadow-2xl">
                            View Chart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="Supporters" className="mt-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                </div>
              </TabsContent>



            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

const allMemes = [
  {
    id: 1,
    title: "Doge to the Moon",
    creator: "CryptoMemer",
    image: "/placeholder.svg?height=300&width=300",
    likes: 1452,
    price: 0.05,
    tokenSymbol: "DOGE",
  },
  {
    id: 2,
    title: "Pepe's Adventure",
    creator: "MemeKing",
    image: "/placeholder.svg?height=300&width=300",
    likes: 982,
    price: 0.03,
    tokenSymbol: "PEPE",
  },
  {
    id: 3,
    title: "Wojak's Feelings",
    creator: "EmotionMaster",
    image: "/placeholder.svg?height=300&width=300",
    likes: 753,
    price: 0.02,
    tokenSymbol: "WOJAK",
  },
  {
    id: 4,
    title: "Stonks Only Go Up",
    creator: "WallStreetBets",
    image: "/placeholder.svg?height=300&width=300",
    likes: 2104,
    price: 0.08,
    tokenSymbol: "STONK",
  },
  {
    id: 5,
    title: "Distracted Boyfriend",
    creator: "MemeClassics",
    image: "/placeholder.svg?height=300&width=300",
    likes: 876,
    price: 0.04,
    tokenSymbol: "DISTRACT",
  },
  {
    id: 6,
    title: "This is Fine",
    creator: "FireMemer",
    image: "/placeholder.svg?height=300&width=300",
    likes: 1203,
    price: 0.06,
    tokenSymbol: "FINE",
  },
  {
    id: 7,
    title: "Galaxy Brain",
    creator: "BrainPower",
    image: "/placeholder.svg?height=300&width=300",
    likes: 654,
    price: 0.03,
    tokenSymbol: "BRAIN",
  },
  {
    id: 8,
    title: "Surprised Pikachu",
    creator: "PokeMemer",
    image: "/placeholder.svg?height=300&width=300",
    likes: 1876,
    price: 0.07,
    tokenSymbol: "PIKA",
  },
]
