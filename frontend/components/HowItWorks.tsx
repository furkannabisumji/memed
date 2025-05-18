import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ChevronRight, Coins, DollarSign, ImageIcon, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HowItWorks() {
    return (
        <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden flex justify-center">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b "></div>
            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-flex items-center rounded-full bg-[#28d358]/10 px-3 py-1 text-sm text-[#28d358]">
                        <Star className="mr-1 h-3.5 w-3.5" />
                        <span>How It Works</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Create Memes, Earn Crypto</h2>
                        <p className="max-w-[900px] text-zinc-400 md:text-xl/relaxed">
                            Our platform makes it easy to monetize your creativity through blockchain technology.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Step 1 */}
                    <div className="group relative flex flex-col rounded-2xl border border-zinc-800  overflow-hidden transition-all  hover:bg-zinc-100">
                        <div className="absolute top-0 right-0 bg-[#28d358] text-black font-bold px-3 py-1 text-sm rounded-bl-lg">
                            Step 01
                        </div>
                        <div className="p-6 pb-0">
                            <h3 className="text-xl font-bold mb-2">Create Memes</h3>
                            <p className="text-zinc-400 mb-4">Use our intuitive meme generator to create viral content</p>
                        </div>
                        <div className="relative h-48 md:h-64 mt-auto overflow-hidden">
                            {/* Interactive Meme Creator Visualization */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="w-full max-w-[280px] bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                                    <div className="bg-zinc-700 px-3 py-2 flex items-center justify-between">
                                        <div className="flex space-x-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-xs text-zinc-300">Meme Creator</div>
                                        <div className="w-4"></div>
                                    </div>
                                    <div className="p-3 bg-zinc-800">
                                        <div className="w-full aspect-square bg-zinc-700 rounded-md flex items-center justify-center mb-2">
                                            <ImageIcon className="h-12 w-12 text-zinc-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 bg-zinc-700 rounded-full w-full"></div>
                                            <div className="h-2 bg-zinc-700 rounded-full w-3/4"></div>
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <div className="bg-primary text-black text-xs font-medium px-2 py-1 rounded">Create</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Animated cursor */}
                            <div className="absolute bottom-8 right-12 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-4 h-4 border-2 border-[#28d358] rounded-full animate-ping"></div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="group relative flex flex-col rounded-2xl border border-zinc-800  overflow-hidden transition-all  hover:bg-zinc-100">
                        <div className="absolute top-0 right-0 bg-[#28d358] text-black font-bold px-3 py-1 text-sm rounded-bl-lg">
                            Step 02
                        </div>
                        <div className="p-6 pb-0">
                            <h3 className="text-xl font-bold mb-2">Stake Tokens</h3>
                            <p className="text-zinc-400 mb-4">Stake your $MEME tokens to earn passive income</p>
                        </div>
                        <div className="relative h-48 md:h-64 mt-auto overflow-hidden">
                            {/* Interactive Staking Visualization */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="w-full max-w-[280px] bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                                    <div className="bg-zinc-700 px-3 py-2 flex items-center justify-between">
                                        <div className="flex space-x-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-xs text-zinc-300">Staking Dashboard</div>
                                        <div className="w-4"></div>
                                    </div>
                                    <div className="p-3 bg-zinc-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs text-zinc-400">Your Balance</div>
                                            <div className="text-xs font-medium text-white/50">1,000 $MEME</div>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-700 rounded-full mb-4">
                                            <div className="h-2 bg-[#28d358] rounded-full w-3/4 group-hover:w-full transition-all duration-1000"></div>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs text-zinc-400">APY</div>
                                            <div className="text-xs font-medium text-[#28d358]">200%</div>
                                        </div>
                                        <div className="mt-3 flex justify-between">
                                            <div className="bg-zinc-700 text-zinc-300 text-xs font-medium px-2 py-1 rounded">25%</div>
                                            <div className="bg-zinc-700 text-zinc-300 text-xs font-medium px-2 py-1 rounded">50%</div>
                                            <div className="bg-[#28d358] text-black text-xs font-medium px-2 py-1 rounded">75%</div>
                                            <div className="bg-zinc-700 text-zinc-300 text-xs font-medium px-2 py-1 rounded">100%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Animated coins */}
                            <div className="absolute bottom-12 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="relative">
                                    <Coins className="h-6 w-6 text-[#28d358] animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="group relative flex flex-col rounded-2xl border border-zinc-800  overflow-hidden transition-all  hover:bg-zinc-100">
                        <div className="absolute top-0 right-0 bg-[#28d358] text-black font-bold px-3 py-1 text-sm rounded-bl-lg">
                            Step 03
                        </div>
                        <div className="p-6 pb-0">
                            <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
                            <p className="text-zinc-400 mb-4">Get rewarded when your content goes viral</p>
                        </div>
                        <div className="relative h-48 md:h-64 mt-auto overflow-hidden">
                            {/* Interactive Rewards Visualization */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="w-full max-w-[280px] bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                                    <div className="bg-zinc-700 px-3 py-2 flex items-center justify-between">
                                        <div className="flex space-x-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-xs text-zinc-300">Rewards Center</div>
                                        <div className="w-4"></div>
                                    </div>
                                    <div className="p-3 bg-zinc-800 text-white/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded bg-zinc-700 mr-2 flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-zinc-500" />
                                                </div>
                                                <div className="text-xs">Viral Meme #1</div>
                                            </div>
                                            <div className="text-xs font-medium text-[#28d358]">+250 $MEME</div>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded bg-zinc-700 mr-2 flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-zinc-500" />
                                                </div>
                                                <div className="text-xs">Weekly Challenge</div>
                                            </div>
                                            <div className="text-xs font-medium text-[#28d358]">+100 $MEME</div>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded bg-zinc-700 mr-2 flex items-center justify-center">
                                                    <Coins className="h-4 w-4 text-zinc-500" />
                                                </div>
                                                <div className="text-xs">Staking Rewards</div>
                                            </div>
                                            <div className="text-xs font-medium text-[#28d358]">+75 $MEME</div>
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-zinc-700 flex justify-between items-center">
                                            <div className="text-xs font-medium">Total Rewards</div>
                                            <div className="text-xs font-bold text-[#28d358]">425 $MEME</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Animated dollar signs */}
                            <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="relative">
                                    <DollarSign className="h-6 w-6 text-[#28d358] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href={'/launch'}>
                    <Button className="py-3 hover:shadow-2xl md:px-8 bg-primary cursor-pointer hover:bg-[#20b348] text-white font-bold hover:-translate-x-0.5 hover:-translate-y-0.5 px-6 h-12 rounded-md">
                        Start Creating <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
