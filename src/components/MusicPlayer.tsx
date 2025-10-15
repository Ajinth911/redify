import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, Maximize2, Music } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export const MusicPlayer = () => {
  const { currentSong, isPlaying, pauseSong, resumeSong, nextSong, previousSong, toggleLike, isLiked } = useMusic();
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // default 3 minutes
  const [isExpanded, setIsExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLocalFile, setIsLocalFile] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  // Detect if it's a local file
  useEffect(() => {
    if (currentSong) {
      setIsLocalFile(currentSong.videoId.startsWith('blob:'));
    }
  }, [currentSong]);

  // Sync playback state
  useEffect(() => {
    if (currentSong) {
      if (isLocalFile && audioRef.current) {
        audioRef.current.src = currentSong.videoId;
        audioRef.current.volume = volume / 100;
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      } else if (iframeRef.current) {
        const src = `https://www.youtube.com/embed/${currentSong.videoId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`;
        iframeRef.current.src = src;
      }
      setProgress(0);
      setCurrentTime(0);
    }
  }, [currentSong, isPlaying, isLocalFile]);

  // Handle audio element events for local files
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLocalFile) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      nextSong();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLocalFile, nextSong]);

  // Simulate progress tracking for YouTube videos only
  useEffect(() => {
    if (isPlaying && currentSong && !isLocalFile) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          setProgress((newTime / duration) * 100);
          if (newTime >= duration) {
            nextSong();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSong, duration, nextSong, isLocalFile]);

  if (!currentSong) return null;

  return (
    <>
      <iframe
        ref={iframeRef}
        className="fixed -bottom-96 left-0 w-1 h-1 pointer-events-none opacity-0"
        allow="autoplay"
      />
      <audio ref={audioRef} className="hidden" />

      {/* Mini Player */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 h-24 bg-[var(--player-background)] backdrop-blur-xl border-t border-border z-40"
          >
            <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl mx-auto">
              {/* Song Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="h-14 w-14 rounded-md object-cover cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium truncate">{currentSong.title}</p>
                  <p className="text-muted-foreground text-sm truncate">{currentSong.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLike(currentSong)}
                  className="shrink-0"
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked(currentSong.id) ? 'fill-primary text-primary' : ''}`}
                  />
                </Button>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={previousSong}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handlePlayPause}
                    className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextSong}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
                <div className="w-full flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[40px]">{formatTime(currentTime)}</span>
                  <Slider
                    value={[progress]}
                    onValueChange={(value) => {
                      setProgress(value[0]);
                      setCurrentTime((value[0] / 100) * duration);
                    }}
                    max={100}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground min-w-[40px]">{currentSong.duration || formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume & Expand */}
              <div className="flex items-center gap-4 flex-1 justify-end">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsExpanded(true)}
                  className="relative"
                >
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 bg-primary/20 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                  <Music className="h-4 w-4 relative z-10" />
                </Button>
              </div>
            </div>

            {/* Hidden YouTube Player for audio playback */}
            {currentSong && (
              <iframe
                ref={iframeRef}
                className="fixed -bottom-96 left-0 w-1 h-1 pointer-events-none opacity-0"
                src={`https://www.youtube.com/embed/${currentSong.videoId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Audio Player"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed inset-0 bg-gradient-to-b from-accent/30 to-background z-50 flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full space-y-8">
                <Button
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                  className="mb-4"
                >
                  Close
                </Button>
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full aspect-square rounded-2xl shadow-2xl object-cover"
                />
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">{currentSong.title}</h2>
                  <p className="text-xl text-muted-foreground">{currentSong.artist}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
