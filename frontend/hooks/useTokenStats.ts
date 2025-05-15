import { useState, useEffect } from "react";
import { TokenStats } from "@/app/types";

interface UseTokenStatsReturn {
  stats: TokenStats | null;
  loading: boolean;
  error: string | null;
}

export function useTokenStats(handle: string | null): UseTokenStatsReturn {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;

    const fetchTokenStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/engagement/aggregated/${handle}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch token statistics");
        }

        const data = await response.json();
        const totalEngagements =
          data.upvotes + data.reposts + data.comments + data.quotes;
        setStats({
          ...data,
          totalEngagements,
          engagementRate:
            totalEngagements > 0
              ? (totalEngagements /
                  (data.upvotes + data.reposts + data.comments + data.quotes)) *
                100
              : 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenStats();
  }, [handle]);

  return { stats, loading, error };
}
