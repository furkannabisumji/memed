"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CompactCardSkeleton() {
  return (
    <Card className="flex">
      {/* Avatar/icon skeleton */}
      <Skeleton className="w-10 h-10 rounded-full" />

      <div className="flex-1">
        {/* Title skeleton */}
        <Skeleton className="w-[100px] h-[20px] rounded-full" />    
        {/* Subtitle skeleton */}
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      </div>

      {/* Action indicator skeleton */}
      <Skeleton className="w-10 h-10 rounded-full" />
    </Card>
  )
}
