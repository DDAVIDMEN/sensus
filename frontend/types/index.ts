export interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface Song {
  id: number;
  title: string;
  description: string;
  is_unlocked: boolean;
}

export interface EmotionResponse {
  id: number;
  user_id: number;
  song_id: number;
  selected_emotion: string;
}

export type ConcertState =
  | "WAITING_START"
  | "SONG_ACTIVE"
  | "SPONSOR"
  | "FINISHED";

export interface ConcertStatus {
  id: number;
  state: ConcertState;
  current_song_id: number | null;
  voting_open: boolean;
  voting_ends_at: string | null;
  sponsor_name: string | null;
}

export type SongStatus = "locked" | "pending" | "answered";

export interface ParticipationResult {
  user_id: number;
  answered_count: number;
  total_questions: number;
  minimum_required: number;
  meets_minimum: boolean;
  remaining_required: number;
}

export interface GlobalOptionResult {
  option: string;
  count: number;
  percentage: number;
}

export interface GlobalSongResult {
  song_id: number;
  title: string;
  display_order: number | null;
  analysis_category: string | null;
  response_count: number;
  top_option: string | null;
  options: GlobalOptionResult[];
}

export interface GlobalResultsResponse {
  total_participants: number;
  total_responses: number;
  total_analyzable_songs: number;
  average_responses_per_participant: number;
  songs: GlobalSongResult[];
}
