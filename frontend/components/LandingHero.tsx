import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

export default function LandingHero() {
    return (
        <div className='relative min-h-[90vh] flex flex-col gap-10 justify-center items-center'>
            <Image alt={'reward-coin'} src={'/coin.png'} width={250} height={100} className='absolute left-0 md:-top-10 top-0 coin-floating' />
            <Image alt={'reward-coin'} src={'/coin.png'} width={250} height={100} className='absolute right-0 bottom-0 coin-floating-2' />
            <div className='font-clash md:text-8xl text-3xl font-bold text-center md:max-w-11/12'>
                <h2>Turn Your Memes Into Tokens</h2>
                <h2>Get Paid for LOLs</h2>
            </div>
            <p className='text-center'>Launch a meme profile on Lens. Mint tokens. Earn through engagement.</p>
            <div className="cta-button flex items-center gap-3 h-full font-clash">
                <Button className='py-3 hover:shadow-2xl h-full md:px-8 font-bold'>Launch your meme</Button>
                <Button className='py-3 hover:shadow-2xl h-full md:px-8 border border-black font-bold' variant={'outline'}>Learn How it works</Button>
            </div>
        </div>
    )
}
