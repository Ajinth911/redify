import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import { Button } from '@/components/ui/button';

export default function LikedSongs() {
  const { likedSongs, playSong, toggleLike } = useMusic();

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-primary/40 to-background p-8 flex items-end"
      >
        <div className="flex items-end gap-6">
          <div className="h-56 w-56 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center shadow-2xl">
            <Heart className="h-28 w-28 text-white" fill="white" />
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-foreground mb-2">PLAYLIST</p>
            <h1 className="text-6xl font-bold text-foreground mb-4">Liked Songs</h1>
            <p className="text-foreground">
              {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      {likedSongs.length > 0 && (
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
            onClick={() => playSong(likedSongs[0])}
          >
            <Play className="h-6 w-6" fill="currentColor" />
          </Button>
        </div>
      )}

      {/* Song List */}
      {likedSongs.length > 0 ? (
        <div className="space-y-1">
          {likedSongs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => playSong(song)}
            >
              <div className="w-10 text-center text-muted-foreground group-hover:hidden">
                {index + 1}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hidden group-hover:flex h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song);
                }}
              >
                <Play className="h-4 w-4" fill="currentColor" />
              </Button>
              <img
                src={song.thumbnail}
                alt={song.title}
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {song.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
              <div className="text-sm text-muted-foreground">{song.duration}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song);
                }}
              >
                <Heart className="h-5 w-5 fill-primary text-primary" />
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg mb-2">No liked songs yet</p>
          <p className="text-muted-foreground text-sm">
            Songs you like will appear here
          </p>
        </div>
      )}
    </div>
  );
}
