export type Competition = 
  | 'BRASILEIRAO_SERIE_A' 
  | 'COPA_LIBERTADORES' 
  | 'UEFA_CHAMPIONS_LEAGUE' 
  | 'PREMIER_LEAGUE' 
  | 'LA_LIGA' 
  | 'WORLD_CUP' 
  | 'COPA_AMERICA';

export interface Fixture {
  competition: Competition;
  home_team: string;
  away_team: string;
  scheduled_at: Date | string;
}

export interface Statistic {
  competition: Competition;
  team: string;
  observed_at: Date | string;
  metrics: {
    goals?: number;
    shots_on_target?: number;
    shots_off_target?: number;
    possession_percentage?: number;
    corners?: number;
    fouls?: number;
    expected_goals?: number;
  };
}

export interface Odds {
  competition: Competition;
  teams: {
    home: string;
    away: string;
  };
  observed_at: Date | string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Behavior {
  competition: Competition;
  behavior: string;
  observed_at: Date | string;
  metadata?: Record<string, any>;
}

export interface Memory {
  competition: Competition;
  teams: string[];
  observed_at: Date | string;
  context_hash: string;
}

export interface Signal {
  competition: Competition;
  signal_family: string; 
  observed_at: Date | string;
  confidence_score: number;
  payload: Record<string, any>;
}

export interface DatasetManifest {
  checksum: string; // Hash SHA-256 do arquivo canónico
  lineage: {
    source: string; // FBref, Football-Data, SofaScore
    extracted_at: string;
    raw_file_size_bytes: number;
  };
  category: 'fixtures' | 'statistics' | 'odds' | 'behaviors' | 'memory' | 'signals';
}