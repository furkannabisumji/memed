import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, Rocket, TrendingUp, Trophy } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] bg-grid-pattern">


      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Floating Meme Elements */}
        {/* <div className="absolute top-20 left-1/4 transform -translate-x-1/2 animate-float">
          <MemeElement type="doge" />
        </div>
        <div className="absolute top-40 right-1/4 transform translate-x-1/2 animate-bounce-slow">
          <MemeElement type="pepe" />
        </div>
        <div className="absolute top-10 right-1/3 transform translate-x-1/2 animate-spin-slow">
          <MemeElement type="stonks" />
        </div>
        <div className="absolute bottom-20 left-1/3 transform -translate-x-1/2 animate-pulse">
          <MemeElement type="moon" />
        </div> */}



        {/* Main Content */}
        <div className="max-w-3xl mx-auto text-center z-10 mt-12">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 relative">
            <span className="inline-block animate-wiggle">Connect</span> on Lens.
            <br />
            <span className="text-green-600">Fuel </span> Meme Culture.
            <span className="absolute -top-6 -right-6 text-2xl animate-bounce-slow hidden md:inline-block">🚀</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Fuel viral battles, rep your memes, and win the internet — on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input type="email" placeholder="Email" className="h-12 bg-white border-gray-200 focus-visible:outline-none" />
            <Button
              variant="outline"
              className="h-12 px-8 border bg-[#28d358] hover:bg-[#28d358] text-white hover:text-white border-none font-medium cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
            >
              Join Waitlist
              <Rocket className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center animate-pulse-slow">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>First to meme. First to earn.</span>
            </div>
          </div>
        </div>



        {/* Confetti Elements */}
        <div className="absolute top-1/3 left-1/5 w-3 h-3 bg-yellow-400 rounded-full animate-float-fast"></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-purple-500 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-green-300 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse-slow"></div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p>
            © 2025 Memed <span className="inline-block animate-spin-slow">🔥</span>
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="https://github.com/furkannabisumji/memed" target="_blank" className="hover:text-green-600 transition-colors">
              GitHub
            </Link>
            <Link href={"/"} target="_blank" className="hover:text-green-600 transition-colors">
              Twitter
            </Link>

          </div>
        </div>
      </footer>
    </div>
  )
}

function MemeElement({ type }: { type: "doge" | "pepe" | "stonks" | "moon" }) {
  switch (type) {
    case "doge":
      return (
        <div className="bg-yellow-300 rounded-full p-3 transform rotate-12 shadow-lg">
          <div className="text-2xl">🐕</div>
        </div>
      )
    case "pepe":
      return (
        <div className="bg-green-400 rounded-lg p-3 transform -rotate-6 shadow-lg">
          <div className="text-2xl">🐸</div>
        </div>
      )
    case "stonks":
      return (
        <div className="bg-red-400 rounded-lg p-3 transform rotate-3 shadow-lg flex items-center">
          <div className="text-xl">📈</div>
        </div>
      )
    case "moon":
      return (
        <div className="bg-blue-300 rounded-full p-3 transform -rotate-12 shadow-lg">
          <div className="text-2xl">🌙</div>
        </div>
      )
    default:
      return null
  }
}
