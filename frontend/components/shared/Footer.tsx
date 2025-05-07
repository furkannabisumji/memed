import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="px-8 py-12 mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-black bg-white rounded-md">
                  MF
                </div>
                <span className="text-lg font-bold text-white">Memed.fun</span>
              </div>
            </Link>
            <p className="text-sm text-white">
              Turn your favorite memes into valuable tokens, build your collection, and join the meme revolution!
            </p>
            
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="text-white transition-colors hover:text-primary">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-white transition-colors hover:text-primary">
                  Launch Meme
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-white transition-colors hover:text-primary">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-white transition-colors hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-white transition-colors hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white transition-colors hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-white transition-colors hover:text-primary">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Subscribe to our newsletter</h3>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" className="bg-gray-100 border-gray-700 text-white outline-none" />
              <Button className="bg-white text-black hover:shadow-2xl" variant={'outline'}>Join</Button>
            </div>
            <p className="mt-2 text-xs text-white">Get the latest updates on new memes and features.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-white md:flex-row">
          <p className="text-xs text-white">© {new Date().getFullYear()} Memed.fun. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/terms" className="text-xs text-white transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-white transition-colors hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
