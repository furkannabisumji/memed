'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from "next/image"
import { Card } from '../ui/card'
import { ClockIcon, FlameIcon } from 'lucide-react'
import { Battle } from './MemeBattles'
import BattleTimer from './BattleTimer'

export default function MemeBattleCard({ battle }: { battle: Battle }) {
    const [battleDummy] = useState({
        id: "uid",
        memes: [
            {
                id: "1",
                title: "When the code finally works",
                image: "/coin.png",
                heatScore: 78,
            },
            {
                id: "2",
                title: "Debugging at 3am",
                image: "/coin.png",
                heatScore: 65,
            },
        ],
        endsAt: new Date(Date.now() + 86400000).toISOString(),
    })

    const winningMeme = battleDummy.memes[0].heatScore > battleDummy.memes[1].heatScore ? 0 : 1
    const totalHeat = battleDummy.memes[0].heatScore + battleDummy.memes[1].heatScore
    const percentages = [
        Math.round((battleDummy.memes[0].heatScore / totalHeat) * 100),
        Math.round((battleDummy.memes[1].heatScore / totalHeat) * 100),
    ]

    const [timeRemaining, setTimeRemaining] = useState("")

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date()
            const end = new Date(battleDummy.endsAt)
            const diff = end.getTime() - now.getTime()

            if (diff <= 0) return "battleDummy ended"

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            return `${hours}h ${minutes}m remaining`
        }

        setTimeRemaining(calculateTimeRemaining())
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining())
        }, 60000)

        return () => clearInterval(timer)
    }, [battleDummy.endsAt])

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-md overflow-hidden bg-white shadow-md border border-gray-200 rounded-xl">
                <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">🔥 Meme battleDummy</h2>
                        <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <BattleTimer endTime={battle.ending} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 relative">
                        {/* Meme 1 */}
                        {battleDummy.memes.map((meme, index) => (
                            <motion.div
                                key={meme.id}
                                className="flex-1"
                                initial={{ opacity: 0, x: index === 0 ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 * (index + 1) }}
                            >
                                <div className="flex items-center mb-2">
                                    <div className="w-20 h-20 relative bg-gray-100 rounded-md overflow-hidden mr-3">
                                        <Image src={meme.image || "/coing.png"} alt={meme.title} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">{meme.title}</h3>
                                        <div className="flex items-center">
                                            <FlameIcon
                                                className={`h-4 w-4 mr-1.5 ${index === winningMeme ? "text-red-500" : "text-gray-400"}`}
                                            />
                                            <span className="text-lg font-semibold">{meme.heatScore}</span>
                                        </div>
                                        {index === winningMeme && (
                                            <span className="mt-1 inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                Leading
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Crossed swords in center */}
                        <motion.div
                            className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2"
                            initial={{ rotate: -15, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring' }}
                        >
                            <div className="flex flex-col items-center text-gray-600 opacity-70">
                                <p>VS</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Heat Bar */}
                    <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{percentages[0]}%</span>
                            <span>{percentages[1]}%</span>
                        </div>
                        <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute left-0 top-0 h-full bg-red-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentages[0]}%` }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </div>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    )
}
