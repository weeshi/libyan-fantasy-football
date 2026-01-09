import { Card } from "@/components/ui/card";

interface Player {
  id?: number;
  name?: string;
  position?: "goalkeeper" | "defender" | "midfielder" | "forward";
  totalPoints?: number;
  teamId?: number;
  jerseyNumber?: number;
  userTeamId?: number;
  playerId?: number;
  purchasePrice?: number;
  isCaptain?: number;
  isOnBench?: number;
}

interface PitchProps {
  players: Player[];
  teamName: string;
}

// Team colors mapping
const teamColors: Record<number, { bg: string; text: string; kit: string }> = {
  1: { bg: "bg-red-600", text: "text-red-600", kit: "🔴" }, // الأهلي بنغازي
  2: { bg: "bg-red-700", text: "text-red-700", kit: "🔴" }, // الأهلي طرابلس
  3: { bg: "bg-white", text: "text-white", kit: "⚪" }, // الهلال البيضاوي
  4: { bg: "bg-yellow-500", text: "text-yellow-500", kit: "🟡" }, // النصر الزاوية
  5: { bg: "bg-blue-600", text: "text-blue-600", kit: "🔵" }, // الفيصلي الزاوية
  6: { bg: "bg-green-600", text: "text-green-600", kit: "🟢" }, // الشرطة طرابلس
  7: { bg: "bg-purple-600", text: "text-purple-600", kit: "🟣" }, // الاتحاد بنغازي
  8: { bg: "bg-orange-600", text: "text-orange-600", kit: "🟠" }, // الثورة الزاوية
  9: { bg: "bg-gray-700", text: "text-gray-700", kit: "⬛" }, // الجيش طرابلس
  10: { bg: "bg-indigo-600", text: "text-indigo-600", kit: "🟦" }, // الوحدة سرت
};

export default function Pitch({ players, teamName }: PitchProps) {
  // Filter out invalid players
  const validPlayers = players.filter(p => p && (p.name || p.position));
  
  // Group players by position
  const goalkeepers = validPlayers.filter((p) => p.position === "goalkeeper");
  const defenders = validPlayers.filter((p) => p.position === "defender");
  const midfielders = validPlayers.filter((p) => p.position === "midfielder");
  const forwards = validPlayers.filter((p) => p.position === "forward");

  const getTeamColor = (teamId: number) => {
    return teamColors[teamId] || { bg: "bg-slate-600", text: "text-slate-600", kit: "⚽" };
  };

  const PlayerToken = ({ player }: { player: Player }) => {
    const color = getTeamColor(player.teamId || 1);
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`w-12 h-16 ${color.bg} rounded-lg flex items-center justify-center border-2 border-white shadow-lg hover:shadow-xl transition`}>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{player.jerseyNumber || "0"}</div>
          </div>
        </div>
        <div className="text-xs font-semibold text-white text-center max-w-12 truncate">{player.name}</div>
        <div className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {player.totalPoints}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-b from-green-800 to-green-900 border-4 border-white overflow-hidden">
      <div className="relative w-full aspect-video bg-gradient-to-b from-green-700 to-green-800 p-4">
        {/* Pitch lines */}
        <div className="absolute inset-0 opacity-20">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white transform -translate-x-1/2"></div>
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          {/* Halfway line */}
          <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between">
          {/* Team Name */}
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">{teamName}</h3>
          </div>

          {/* Goalkeepers Row */}
          <div className="flex justify-center gap-4">
            {goalkeepers.length > 0 ? (
              goalkeepers.map((player) => <PlayerToken key={player.id} player={player} />)
            ) : (
              <div className="text-white text-sm opacity-50">لا توجد حراس</div>
            )}
          </div>

          {/* Defenders Row */}
          <div className="flex justify-center gap-3 flex-wrap">
            {defenders.length > 0 ? (
              defenders.map((player) => <PlayerToken key={player.id} player={player} />)
            ) : (
              <div className="text-white text-sm opacity-50">لا توجد مدافعين</div>
            )}
          </div>

          {/* Midfielders Row */}
          <div className="flex justify-center gap-3 flex-wrap">
            {midfielders.length > 0 ? (
              midfielders.map((player) => <PlayerToken key={player.id} player={player} />)
            ) : (
              <div className="text-white text-sm opacity-50">لا توجد لاعبي وسط</div>
            )}
          </div>

          {/* Forwards Row */}
          <div className="flex justify-center gap-4">
            {forwards.length > 0 ? (
              forwards.map((player) => <PlayerToken key={player.id} player={player} />)
            ) : (
              <div className="text-white text-sm opacity-50">لا توجد مهاجمين</div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="text-center mt-2">
            <div className="text-white text-sm">
              <span className="font-semibold">{validPlayers.length}</span> لاعب | 
              <span className="font-semibold ml-2">{validPlayers.reduce((sum, p) => sum + (p.totalPoints || 0), 0)}</span> نقطة
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
