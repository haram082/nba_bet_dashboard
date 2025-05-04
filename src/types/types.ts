export interface GameData {
  game_id: string;
  game_date: string;
  matchup: string;
  team_id: string;
  is_home: string;
  wl: string;
  w: string;
  l: string;
  w_pct: string;
  fgm: string;
  fga: string;
  fg_pct: string;
  fg3m: string;
  fg3a: string;
  fg3_pct: string;
  ftm: string;
  fta: string;
  oreb: string;
  dreb: string;
  reb: string;
  ast: string;
  stl: string;
  blk: string;
  tov: string;
  pf: string;
  pts: string;
  a_team_id: string;
  season_year: string;
  season_type: string;
  season: string;
  season_start: string;
  opp_team_id: string;
  opp_pts: string;
  point_margin: string;
  spread: string;
  price: string;
  moneyline_price: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface FilterState {
  selectedTeam: string;
  selectedYear: number;
} 