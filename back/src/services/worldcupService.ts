import fbrClient from "../utils/axiosClient";
import { TeamStats, MatchResult } from "../models/teamStats";

export class WorldcupService {
  private static YEARS = [
    2022, 2018, 2014, 2010, 2006, 2002, 1998, 1994, 1990, 1986, 1982, 1978,
    1974, 1970, 1966, 1962, 1958, 1954, 1950, 1938, 1934, 1930,
  ];

  public getYears(): number[] {
    return WorldcupService.YEARS;
  }

  public async getTeams(year: number): Promise<string[]> {
    const resp = await fbrClient.get(
      `/league-standings?league_id=1&season_id=${year}`
    );
    console.log(resp);
    const names: string[] = [];
    resp.data.data.forEach((group: any) =>
      group.standings.forEach((t: any) => names.push(t.team_name))
    );
    return names;
  }

  public async getTeamStats(team: string, year: number): Promise<TeamStats> {
    const resp = await fbrClient.get(
      `/league-standings?league_id=1&season_id=${year}`
    );
    let stats: TeamStats | null = null;

    resp.data.data.forEach((group: any) =>
      group.standings.forEach((t: any) => {
        if (t.team_name.toLowerCase() === team.toLowerCase()) {
          stats = t;
        }
      })
    );

    if (!stats) throw new Error("NOT_FOUND");
    return stats;
  }

  public calculateTeamStrength(stats: TeamStats): number {
    if (stats.mp === 0) return 0.5;

    const winRate = stats.w / stats.mp;
    const avgGoalsScored = stats.gf / stats.mp;
    const avgGoalsConceded = stats.ga / stats.mp;
    const goalDifference = (stats.gf - stats.ga) / stats.mp;

    let xgFactor = 0;
    if (stats.xg != null && stats.xga != null) {
      const xgPerGame = (stats.xg - stats.xga) / stats.mp;
      xgFactor = Math.max(-2, Math.min(2, xgPerGame));
    }

    let strength = 0;
    strength += winRate * 0.3;
    strength += Math.min(avgGoalsScored / 2.5, 1.2) * 0.2;
    const defenseFactor = Math.max(0, 1 - avgGoalsConceded / 2.5);
    strength += defenseFactor * 0.2;
    const gdFactor = Math.max(-1, Math.min(1, goalDifference / 2));
    strength += ((gdFactor + 1) / 2) * 0.15;

    if (stats.xg != null && stats.xga != null) {
      const xgNormalized = Math.max(-1, Math.min(1, xgFactor / 2));
      strength += ((xgNormalized + 1) / 2) * 0.15;
    } else {
      strength += ((gdFactor + 1) / 2) * 0.15;
    }

    strength = Math.pow(strength, 0.8);
    return Math.max(0.05, Math.min(0.95, strength));
  }

  public calculateProbabilities(homeStrength: number, awayStrength: number) {
    const homeAdvantage = 0.03;
    const adjustedHome = Math.min(0.98, homeStrength + homeAdvantage);
    const diff = adjustedHome - awayStrength;
    const amplified = Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 1.5;

    let homeWin = 0.33 + amplified * 0.5;
    let awayWin = 0.33 - amplified * 0.5;
    let draw = 0.34;

    const gap = Math.abs(diff);
    if (gap > 0.3) {
      const reduction = Math.min(0.15, gap * 0.3);
      draw -= reduction;
      if (diff > 0) homeWin += reduction;
      else awayWin += reduction;
    } else if (gap < 0.05) {
      draw += 0.08;
      homeWin -= 0.04;
      awayWin -= 0.04;
    }

    homeWin = Math.max(0.05, homeWin);
    awayWin = Math.max(0.05, awayWin);
    draw = Math.max(0.05, draw);

    const total = homeWin + draw + awayWin;
    return {
      homeWin: Math.round((homeWin / total) * 100) / 100,
      draw: Math.round((draw / total) * 100) / 100,
      awayWin: Math.round((awayWin / total) * 100) / 100,
    };
  }

  public simulateGoals(teamStrength: number, opponentStrength: number): number {
    const diff = teamStrength - opponentStrength;
    const base = 1.2 + diff * 2.5;
    const avg = Math.max(0.1, Math.min(4, base));

    let goals = 0;
    let prob = Math.exp(-avg);
    let cumProb = prob;
    const rand = Math.random();

    while (cumProb < rand && goals < 8) {
      goals++;
      prob *= avg / goals;
      cumProb += prob;
    }

    return goals;
  }

  public simulateMatch(
    home: { name: string; stats: TeamStats },
    away: { name: string; stats: TeamStats }
  ): MatchResult {
    const homeS = this.calculateTeamStrength(home.stats);
    const awayS = this.calculateTeamStrength(away.stats);
    const prob = this.calculateProbabilities(homeS, awayS);
    const homeGoals = this.simulateGoals(homeS, awayS);
    const awayGoals = this.simulateGoals(awayS, homeS);

    let result: "home" | "away" | "draw" = "draw";
    if (homeGoals > awayGoals) result = "home";
    else if (awayGoals > homeGoals) result = "away";

    return {
      homeTeam: { name: home.name, goals: homeGoals },
      awayTeam: { name: away.name, goals: awayGoals },
      result,
      probability: prob,
    };
  }

  public simulateMultiple(
    home: { name: string; stats: TeamStats },
    away: { name: string; stats: TeamStats },
    runs: number
  ) {
    const results: MatchResult[] = [];
    let homeWins = 0,
      draws = 0,
      awayWins = 0;
    let totalHome = 0,
      totalAway = 0;

    for (let i = 0; i < runs; i++) {
      const r = this.simulateMatch(home, away);
      results.push(r);
      if (r.result === "home") homeWins++;
      else if (r.result === "draw") draws++;
      else awayWins++;
      totalHome += r.homeTeam.goals;
      totalAway += r.awayTeam.goals;
    }

    return {
      simulations: runs,
      summary: {
        homeWins: `${homeWins} (${Math.round((homeWins / runs) * 100)}%)`,
        draws: `${draws} (${Math.round((draws / runs) * 100)}%)`,
        awayWins: `${awayWins} (${Math.round((awayWins / runs) * 100)}%)`,
      },
      averageGoals: {
        home: Math.round((totalHome / runs) * 100) / 100,
        away: Math.round((totalAway / runs) * 100) / 100,
      },
      theoreticalProbability: results[0].probability,
      results,
    };
  }
}

export default new WorldcupService();
