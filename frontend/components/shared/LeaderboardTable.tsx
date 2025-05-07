import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function LeaderboardTable() {
    return (
        <Table className='border-2 border-black md:scale-100 scale-90'>
            <TableCaption>Token Leaderboard</TableCaption>
            <TableHeader className='bg-secondary font-semibold border-b-2 border-black'>
                <TableRow>
                    <TableHead className="w-[100px]">#</TableHead>
                    <TableHead>Meme</TableHead>
                    <TableHead className="">Price</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Holders</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[
                    {
                        name: 'Doge to the moon',
                        price: '0.5',
                        percent: '12.6',
                        profit: true,
                        volume: 204,
                        holders: 2018
                    },
                    {
                        name: 'Doge to the moon',
                        price: '0.5',
                        percent: '12.6',
                        profit: true,
                        volume: 204,
                        holders: 2018
                    },
                    {
                        name: 'Doge to the moon',
                        price: '0.5',
                        percent: '12.6',
                        profit: true,
                        volume: 204,
                        holders: 2018
                    },
                    {
                        name: 'Doge to the moon',
                        price: '0.5',
                        percent: '12.6',
                        profit: true,
                        volume: 204,
                        holders: 2018
                    },
                    {
                        name: 'Doge to the moon',
                        price: '0.5',
                        percent: '12.6',
                        profit: true,
                        volume: 204,
                        holders: 2018
                    },
                ].map((row, key) => (
                    <TableRow key={key} >
                        <TableCell className="font-medium py-7">{key + 1}</TableCell>
                        <TableCell>
                            <div className='flex items-center gap-2 '>
                                <div className='w-8 h-8 bg-gray-200 rounded-full border-1 border-black'></div>
                                {row.name}
                            </div>
                        </TableCell>
                        <TableCell>{row.price} ETH</TableCell>
                        <TableCell className="text-right"> {row.percent}% </TableCell>
                        <TableCell className="text-right">{row.price} ETH </TableCell>
                        <TableCell className="text-right">{row.holders} </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

    )
}
