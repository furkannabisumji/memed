import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { LinkIcon, Loader2 } from 'lucide-react'

export default function ConnectProfile({ handleConnectLens, isConnected }: { handleConnectLens: () => void, isConnected: boolean }) {
    return (
        <div className="p-8 border-2 border-black">
            <h1 className="mb-6 text-4xl font-black text-black">Connect Your Lens Profile</h1>
            <p className="mb-8 text-lg text-gray-600">
                To create a meme token, you'll need to connect your Lens profile. This will allow you to mint tokens
                and earn from engagement.
            </p>

            <div className="flex items-center p-6 mb-8 bg-accent border-2 border-black">
                <div>
                    <h3 className="mb-1 text-xl font-bold">Lens Protocol</h3>
                    <p className="text-gray-600">The social layer for Web3. Connect once, use everywhere.</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                    size="lg"
                    className="gap-2 bg-primary hover:shadow-2xl cursor-pointer hover:bg-primary/90"
                    onClick={handleConnectLens}
                    disabled={isConnected}
                >
                    {isConnected ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <LinkIcon className="w-4 h-4" />
                            Connect Lens Profile
                        </>
                    )}
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 hover:shadow-2xl cursor-pointer shadow-none border-2 border-black text-black"
                >
                    Create Lens Profile
                </Button>
            </div>
        </div>
    )
}
