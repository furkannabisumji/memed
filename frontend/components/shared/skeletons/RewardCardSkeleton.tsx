"use client"

import { Card } from "@/components/ui/card"

export function RewardCardSkeleton() {
  return (
    <Card className="relative overflow-hidden rounded-md transition-all duration-300 bg-white border-2 border-gray-200 py-0 ">
      <div className="flex">
        {/* Left side - Image skeleton */}
        <div className="w-20 h-20 flex-shrink-0 border-r-2 border-gray-200 relative overflow-hidden">
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        </div>

        {/* Right side - Content skeleton */}
        <div className="flex-1 p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                {/* Title skeleton */}
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                {/* Badge skeleton */}
                <div className="h-4 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Username skeleton */}
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2" />

              <div className="flex items-center gap-2 mt-1">
                {/* Type label skeleton */}
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                {/* Amount skeleton */}
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Button skeleton */}
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
