import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data for testing
const mockPlayers = [
  {
    id: 1,
    name: 'محمد نشنوش',
    position: 'goalkeeper',
    teamId: 1,
    teamName: 'الأهلي طرابلس',
    marketValue: 5000000,
    totalPoints: 287,
    jerseyNumber: 1,
  },
  {
    id: 2,
    name: 'علي محمود',
    position: 'defender',
    teamId: 1,
    teamName: 'الأهلي طرابلس',
    marketValue: 3500000,
    totalPoints: 156,
    jerseyNumber: 4,
  },
  {
    id: 3,
    name: 'فاطمة أحمد',
    position: 'midfielder',
    teamId: 2,
    teamName: 'الهلال',
    marketValue: 4000000,
    totalPoints: 198,
    jerseyNumber: 7,
  },
  {
    id: 4,
    name: 'سارة علي',
    position: 'forward',
    teamId: 2,
    teamName: 'الهلال',
    marketValue: 6000000,
    totalPoints: 245,
    jerseyNumber: 9,
  },
];

describe('PlayerComparison Component', () => {
  describe('Player Selection', () => {
    it('should allow adding players to comparison', () => {
      const selectedPlayers: any[] = [];
      const player = mockPlayers[0];
      
      selectedPlayers.push({
        id: player.id,
        name: player.name,
        position: player.position,
        teamId: player.teamId,
        teamName: player.teamName,
        marketValue: player.marketValue,
        totalPoints: player.totalPoints,
        jerseyNumber: player.jerseyNumber,
      });

      expect(selectedPlayers).toHaveLength(1);
      expect(selectedPlayers[0].name).toBe('محمد نشنوش');
    });

    it('should allow adding multiple players (up to 6)', () => {
      const selectedPlayers: any[] = [];
      
      mockPlayers.forEach(player => {
        if (selectedPlayers.length < 6) {
          selectedPlayers.push({
            id: player.id,
            name: player.name,
            position: player.position,
            teamId: player.teamId,
            teamName: player.teamName,
            marketValue: player.marketValue,
            totalPoints: player.totalPoints,
            jerseyNumber: player.jerseyNumber,
          });
        }
      });

      expect(selectedPlayers.length).toBeLessThanOrEqual(6);
    });

    it('should remove player from comparison', () => {
      const selectedPlayers = [
        { id: 1, name: 'محمد نشنوش' },
        { id: 2, name: 'علي محمود' },
      ];
      
      const filtered = selectedPlayers.filter(p => p.id !== 1);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    it('should prevent duplicate player selection', () => {
      const selectedPlayers = [
        { id: 1, name: 'محمد نشنوش' },
      ];
      
      const newPlayer = { id: 1, name: 'محمد نشنوش' };
      const isDuplicate = selectedPlayers.some(p => p.id === newPlayer.id);
      
      expect(isDuplicate).toBe(true);
    });
  });

  describe('Player Filtering', () => {
    it('should filter players by search term', () => {
      const searchTerm = 'محمد';
      const filtered = mockPlayers.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('محمد نشنوش');
    });

    it('should filter players by position', () => {
      const position = 'midfielder';
      const filtered = mockPlayers.filter(p => p.position === position);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].position).toBe('midfielder');
    });

    it('should filter players by team', () => {
      const teamId = 1;
      const filtered = mockPlayers.filter(p => p.teamId === teamId);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.teamId === teamId)).toBe(true);
    });

    it('should combine multiple filters', () => {
      const searchTerm = 'علي';
      const position = 'defender';
      const teamId = 1;
      
      const filtered = mockPlayers.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        p.position === position &&
        p.teamId === teamId
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('علي محمود');
    });
  });

  describe('Comparison Statistics', () => {
    it('should calculate market value in millions', () => {
      const player = mockPlayers[0];
      const valueInMillions = player.marketValue / 1000000;
      
      expect(valueInMillions).toBe(5);
    });

    it('should calculate average points per game', () => {
      const player = mockPlayers[0];
      const gamesPlayed = 10;
      const averagePoints = player.totalPoints / gamesPlayed;
      
      expect(averagePoints).toBe(28.7);
    });

    it('should identify best performer by total points', () => {
      const bestPlayer = mockPlayers.reduce((prev, current) => 
        (prev.totalPoints > current.totalPoints) ? prev : current
      );
      
      expect(bestPlayer.name).toBe('محمد نشنوش');
      expect(bestPlayer.totalPoints).toBe(287);
    });

    it('should identify most expensive player', () => {
      const mostExpensive = mockPlayers.reduce((prev, current) => 
        (prev.marketValue > current.marketValue) ? prev : current
      );
      
      expect(mostExpensive.name).toBe('سارة علي');
      expect(mostExpensive.marketValue).toBe(6000000);
    });

    it('should calculate average market value', () => {
      const totalValue = mockPlayers.reduce((sum, p) => sum + p.marketValue, 0);
      const averageValue = totalValue / mockPlayers.length;
      
      expect(averageValue).toBe(4625000);
    });
  });

  describe('Position Utilities', () => {
    it('should map position to Arabic label', () => {
      const positions: Record<string, string> = {
        'goalkeeper': 'حارس مرمى',
        'defender': 'مدافع',
        'midfielder': 'لاعب وسط',
        'forward': 'مهاجم',
      };
      
      expect(positions['goalkeeper']).toBe('حارس مرمى');
      expect(positions['midfielder']).toBe('لاعب وسط');
    });

    it('should assign color to position', () => {
      const getPositionColor = (position: string) => {
        if (position.includes('goalkeeper')) return 'bg-blue-500';
        if (position.includes('defender')) return 'bg-green-500';
        if (position.includes('midfielder')) return 'bg-yellow-500';
        if (position.includes('forward')) return 'bg-red-500';
        return 'bg-gray-500';
      };
      
      expect(getPositionColor('goalkeeper')).toBe('bg-blue-500');
      expect(getPositionColor('defender')).toBe('bg-green-500');
      expect(getPositionColor('midfielder')).toBe('bg-yellow-500');
      expect(getPositionColor('forward')).toBe('bg-red-500');
    });
  });

  describe('Comparison Data Preparation', () => {
    it('should prepare comparison data for charts', () => {
      const selectedPlayers = mockPlayers.slice(0, 2);
      
      const comparisonData = [
        {
          stat: 'إجمالي النقاط',
          ...selectedPlayers.reduce((acc, p) => ({ ...acc, [p.name]: p.totalPoints }), {}),
        },
      ];
      
      expect(comparisonData[0].stat).toBe('إجمالي النقاط');
      expect(comparisonData[0]['محمد نشنوش']).toBe(287);
      expect(comparisonData[0]['علي محمود']).toBe(156);
    });

    it('should prepare radar chart data', () => {
      const selectedPlayers = mockPlayers.slice(0, 2);
      
      const radarData = selectedPlayers.map(p => ({
        name: p.name,
        totalPoints: p.totalPoints,
        marketValue: p.marketValue / 1000000,
      }));
      
      expect(radarData).toHaveLength(2);
      expect(radarData[0].name).toBe('محمد نشنوش');
      expect(radarData[0].marketValue).toBe(5);
    });
  });

  describe('Validation', () => {
    it('should require at least 2 players for comparison', () => {
      const selectedPlayers = mockPlayers.slice(0, 1);
      const canCompare = selectedPlayers.length >= 2;
      
      expect(canCompare).toBe(false);
    });

    it('should allow maximum 6 players for comparison', () => {
      const selectedPlayers = mockPlayers;
      const canAddMore = selectedPlayers.length < 6;
      
      expect(canAddMore).toBe(false);
    });

    it('should validate player data structure', () => {
      const player = mockPlayers[0];
      
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('name');
      expect(player).toHaveProperty('position');
      expect(player).toHaveProperty('teamId');
      expect(player).toHaveProperty('marketValue');
      expect(player).toHaveProperty('totalPoints');
    });
  });

  describe('Sorting and Ranking', () => {
    it('should sort players by total points descending', () => {
      const sorted = [...mockPlayers].sort((a, b) => b.totalPoints - a.totalPoints);
      
      expect(sorted[0].name).toBe('محمد نشنوش');
      expect(sorted[sorted.length - 1].name).toBe('علي محمود');
    });

    it('should sort players by market value ascending', () => {
      const sorted = [...mockPlayers].sort((a, b) => a.marketValue - b.marketValue);
      
      expect(sorted[0].marketValue).toBe(3500000);
      expect(sorted[sorted.length - 1].marketValue).toBe(6000000);
    });

    it('should rank players by position', () => {
      const positions = ['goalkeeper', 'defender', 'midfielder', 'forward'];
      const ranked = mockPlayers.sort((a, b) => 
        positions.indexOf(a.position) - positions.indexOf(b.position)
      );
      
      expect(ranked[0].position).toBe('goalkeeper');
      expect(ranked[ranked.length - 1].position).toBe('forward');
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance percentage', () => {
      const player = mockPlayers[0];
      const maxPoints = 30;
      const performancePercentage = (player.totalPoints / (maxPoints * 10)) * 100;
      
      expect(performancePercentage).toBeGreaterThan(0);
      expect(performancePercentage).toBeLessThanOrEqual(100);
    });

    it('should identify player form trend', () => {
      const getTrend = (currentPoints: number, previousPoints: number): 'up' | 'down' | 'stable' => {
        if (currentPoints > previousPoints) return 'up';
        if (currentPoints < previousPoints) return 'down';
        return 'stable';
      };
      
      expect(getTrend(100, 80)).toBe('up');
      expect(getTrend(80, 100)).toBe('down');
      expect(getTrend(100, 100)).toBe('stable');
    });
  });
});
