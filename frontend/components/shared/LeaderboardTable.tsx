'use client'
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
import { LeaderboardData, useLeaderboard } from '@/hooks/useLeaderBoard';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TrendingUp, Trophy } from 'lucide-react';

export default function LeaderboardTable() {
    const {
        topMemes,
        topCreators,
        isLoading: isLeaderboardLoading,
        isError,
        error,
    }: LeaderboardData = useLeaderboard();
    return (
        <>
            {isLeaderboardLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="bg-white rounded-lg shadow overflow-hidden border-2 border-black">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                        Rank
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                        Creator
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                                    >
                                        Score
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                                    >
                                        Memes
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                        Heat score
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topCreators.map((creator, index) => (
                                    <tr
                                        key={creator.creator}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                    {index + 1 <= 3 ? (
                                                        <Trophy
                                                            size={14}
                                                            className={
                                                                index + 1 === 1
                                                                    ? "text-yellow-500"
                                                                    : index + 1 === 2
                                                                        ? "text-gray-400"
                                                                        : "text-amber-700"
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-medium">
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <Avatar className="h-8 w-8 mr-2">
                                                        <AvatarImage
                                                            src={
                                                                (creator.creatorData?.metadata
                                                                    ?.picture as string) || ""
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {creator.creatorData?.metadata?.name?.substring(
                                                                0,
                                                                2
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {creator.creator}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {/* @ts-ignore */}@
                                                        {creator.creatorData.username.localName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <TrendingUp
                                                    size={16}
                                                    className="mr-1 text-green-500"
                                                />
                                                <span className="text-sm text-gray-900">
                                                    {creator.creatorData?.score || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">
                                                    {creator.memeCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">
                                                    {creator.totalHeat}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* We'll use the global load more button instead */}
                </div>
            )}
        </>
    )
}
