export interface TeamStats {
  mp: number;
  w: number;
  l: number;
  gf: number;
  ga: number;
  xg?: number;
  xga?: number;
}

export interface MatchResult {
  homeTeam: { name: string; goals: number };
  awayTeam: { name: string; goals: number };
  result: "home" | "away" | "draw";
  probability: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
}
