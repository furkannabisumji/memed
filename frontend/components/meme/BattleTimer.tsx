'use client'

import React, { useEffect, useState } from 'react'

function getRemainingTime(endTime: Date): string {
    const now = Date.now();
    const diff = endTime.getTime() - now;
  
    if (diff <= 0) return "Ended";
  
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
    const parts = [];
  
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`); // always show seconds
  
    return parts.join(" ");
  }
export default function BattleTimer({ endTime }: { endTime: Date }) {
    const [timeLeft, setTimeLeft] = useState(getRemainingTime(endTime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getRemainingTime(endTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return <span>{timeLeft}</span>;
}
