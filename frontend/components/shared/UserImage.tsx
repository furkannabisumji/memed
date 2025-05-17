import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAccountByUsername } from "@/lib/lens";
import { useEffect, useState } from "react";
import { Account } from "@/app/types";

export const UserImage = ({ username }: { username: string }) => {
  const [account, setAccount] = useState<Account | null>(null);
//   console.log(account);
  useEffect(() => {
    async function fetchAccount() {
      const account = (await getAccountByUsername(username)) as Account;
      setAccount(account);
    }
    fetchAccount();
  }, [username]);
  return (
    <Avatar className="h-8 w-8 mr-2">
      <AvatarImage src={(account?.metadata?.picture as string) || ""} />
      <AvatarFallback>
        {account?.metadata?.name?.substring(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
};
