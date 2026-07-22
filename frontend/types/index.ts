export interface User {
  id: number;
  email: string;
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