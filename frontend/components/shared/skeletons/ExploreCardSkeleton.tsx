"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function ExploreCardSkeleton() {
  return (
    <Card className="w-full max-w-md overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 animate-pulse" />

      <CardHeader className="pb-2">
        {/* Title skeleton */}
        <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />

        {/* Subtitle skeleton */}
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Content paragraph skeletons */}
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />

        {/* Tags skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {/* Action buttons skeleton */}
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
      </CardFooter>
    </Card>
  )
}
