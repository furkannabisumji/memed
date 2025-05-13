import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const RenderBattleCard = ({
  battle,
  profile,
}: {
  battle: any;
  profile: any;
}) => (
  <Card
    key={battle.id}
    className="border-2 border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
  >
    <CardContent className="p-0">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge
            className={
              battle.status === "ongoing"
                ? "bg-blue-500 hover:bg-blue-500"
                : battle.status === "won"
                ? "bg-green-500 hover:bg-green-500"
                : "bg-red-500 hover:bg-red-500"
            }
          >
            {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
          </Badge>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={battle.opponentImage} alt={battle.opponent} />
              <AvatarFallback>{battle.opponent.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <h4 className="font-medium">vs {battle.opponent}</h4>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {battle.status === "ongoing"
            ? `Ends ${new Date(battle.endTime).toLocaleDateString()}`
            : `Ended ${new Date(battle.endTime).toLocaleDateString()}`}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{profile.displayName}</span>
          <span className="text-sm font-medium">{battle.opponent}</span>
        </div>

        <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              battle.status === "won"
                ? "bg-green-500"
                : battle.status === "lost"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{
              width: `${
                (battle.votes / (battle.votes + battle.opponentVotes)) * 100
              }%`,
            }}
          ></div>
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-sm">{battle.votes.toLocaleString()} votes</span>
          <span className="text-sm">
            {battle.opponentVotes.toLocaleString()} votes
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);
