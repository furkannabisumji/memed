"use client"

import { Card } from "@/components/ui/card"

export function BattleCardSkeleton() {
  return (
    <Card className="w-full max-w-full shadow-md relative rounded-md transition-all duration-300 bg-white border-2 border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          {/* Title skeleton */}
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />

          {/* Timer skeleton */}
          <div className="flex items-center">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 relative">
          {/* Left meme skeleton */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-32 h-32 bg-gray-200 rounded-md animate-pulse mr-3" />
              <div>
                {/* Name skeleton */}
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />

                {/* Score skeleton */}
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2" />

                {/* Badge skeleton */}
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Center icon skeleton */}
          <div className="-translate-x-1/2">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Right meme skeleton */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-32 h-32 bg-gray-200 rounded-md animate-pulse mr-3" />
              <div>
                {/* Name skeleton */}
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />

                {/* Score skeleton */}
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2" />

                {/* Badge skeleton (optional) */}
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Heat Bar skeleton */}
        <div className="mt-6">
          <div className="flex justify-between mb-1">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </Card>
  )
}
