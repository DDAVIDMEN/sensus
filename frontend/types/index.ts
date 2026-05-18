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
