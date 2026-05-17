"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";

interface Song {
  id: number;
  title: string;
  description: string;
  is_unlocked: boolean;
}

interface UserResponse {
  [songId: number]: string;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [responses, setResponses] = useState<UserResponse>({});

  const USER_ID = 1;

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await api.get("/songs/");
      setSongs(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmotionSelect = async (
    songId: number,
    emotion: string
  ) => {
    try {
      await api.post("/responses/", {
        user_id: USER_ID,
        song_id: songId,
        selected_emotion: emotion,
      });

      setResponses((prev) => ({
        ...prev,
        [songId]: emotion,
      }));

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Canciones</h1>

      {songs.map((song) => (
        <div
          key={song.id}
          style={{
            border: "1px solid gray",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h2>{song.title}</h2>

          <p>{song.description}</p>

          {song.is_unlocked ? (
            <div style={{ marginTop: "12px" }}>
                <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
                    Esta canción me hace sentir:
                </p>

                <div
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    }}
                >
                    {["Alegría", "Nostalgia", "Esperanza"].map((emotion) => (
                    <label
                        key={emotion}
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        }}
                    >
                        <input
                        type="radio"
                        name={`song-${song.id}`}
                        value={emotion}
                        checked={responses[song.id] === emotion}
                        onChange={() =>
                            handleEmotionSelect(song.id, emotion)
                        }
                        />

                        {emotion}
                    </label>
                    ))}
                </div>


            </div>
          ) : (
            <p>🔒 Canción bloqueada</p>
          )}
        </div>
      ))}
    </div>
  );
}