import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  likedSongs: Song[];
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  addToQueue: (song: Song) => void;
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('likedSongs');
    return saved ? JSON.parse(saved) : [];
  });

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  const pauseSong = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeSong = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const nextSong = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(queue.slice(1));
      playSong(next);
    }
  }, [queue, playSong]);

  const previousSong = useCallback(() => {
    // Simple implementation - could be enhanced with history
    if (queue.length > 1) {
      const prev = queue[queue.length - 1];
      playSong(prev);
    }
  }, [queue, playSong]);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const toggleLike = useCallback((song: Song) => {
    setLikedSongs(prev => {
      const isAlreadyLiked = prev.some(s => s.id === song.id);
      const updated = isAlreadyLiked
        ? prev.filter(s => s.id !== song.id)
        : [...prev, song];
      
      localStorage.setItem('likedSongs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLiked = useCallback((songId: string) => {
    return likedSongs.some(s => s.id === songId);
  }, [likedSongs]);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        likedSongs,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        previousSong,
        addToQueue,
        toggleLike,
        isLiked,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};
