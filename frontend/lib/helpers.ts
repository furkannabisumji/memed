//truncate address

/**
 * Truncates an Ethereum address to a more readable format
 * @param address The full Ethereum address (0x...)
 * @param startLength Number of characters to show at the start (default: 6)
 * @param endLength Number of characters to show at the end (default: 4)
 * @returns Truncated address (e.g., '0x1a2b3c...d4e5f6')
 */
export const truncateAddress = (
  address: string,
  startLength = 6,
  endLength = 4
): string => {
  if (!address || typeof address !== "string") return "";
  if (address.length <= startLength + endLength) return address;

  const start = address.substring(0, startLength);
  const end = address.substring(address.length - endLength);
  return `${start}...${end}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  } else {
    return num.toString();
  }
};
