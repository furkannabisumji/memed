import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="md:flex md:px-20 hidden w-full border-t bg-background text-muted-foreground px-4 py-3 text-sm flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2">
          <div className="bg-white text-black font-bold rounded w-6 h-6 flex items-center justify-center text-xs">MF</div>
          <span className="font-medium">Memed.fun</span>
        </span>
        <div className="flex gap-4 mt-2 md:mt-0 text-xs">
          <Link href="/" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">FAQ</Link>
        </div>
      </div>

      <span className="mt-2 md:mt-0 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Memed.fun
      </span>
    </footer>

  )
}
