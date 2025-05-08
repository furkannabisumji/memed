import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function HowItWorks() {
    return (
        <div className='bg-secondary flex flex-col md:flex-row' id='process'>
            <div className="process md:w-1/2 py-20 md:px-20 px-5">
                <Card className='bg-white py-32'>
                    
                </Card>
            </div>
            <div className='md:w-1/2 py-20 md:px-20 px-5'>
                <Card className='bg-primary py-32'>
                    <CardHeader>
                        <CardTitle className='font-clash text-4xl uppercase text-white'>Your Meme. Your Token. <span className='text-[#00691D]'>Your Economy.</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-white  text-xl font-medium'>Memed.fun transforms internet culture into real, tradable assets. With just your Lens handle, you can spin up an on-chain meme profile, mint a billion meme tokens, and launch a micro-economy around your viral genius. It’s permissionless, instant, and built for creators who meme with meaning.

                            We track engagement like likes, mirrors, and comments — and reward you in tokens. The more people laugh, the more you earn. This isnt just meme magic — its on-chain social clout turned capital.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
