import { Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function MemeCard({ meme }: {
    meme: {
        id: number;
        title: string;
        creator: string;
        image: string;
        likes: number;
        price: number;
        tokenSymbol: string;
    }
}) {
    return (
        <Link href={`/meme/${meme.id}`} className="group">
            <div className="relative overflow-hidden rounded-md transition-all bg-white border-2 border-black group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative aspect-square">
                    <Image
                        src={meme.image || "/fallback.png"}
                        alt={meme.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform bg-white border-t-2 border-black">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-black">{meme.title}</h3>
                            <p className="text-sm text-gray-600">@{meme.creator}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 text-white bg-primary rounded-full">
                            <Zap size={14} />
                            <span className="font-bold">${meme.tokenSymbol}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>

    )
}
