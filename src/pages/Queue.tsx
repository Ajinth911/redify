import { motion } from 'framer-motion';
import { Music2, Play, Trash2 } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import { Button } from '@/components/ui/button';

export default function Queue() {
  const { queue, playSong, currentSong } = useMusic();

  const removeFromQueue = (index: number) => {
    // Note: This would require adding a removeFromQueue function to MusicContext
    console.log('Remove from queue:', index);
  };

  return (
    <div className="space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Queue</h1>
        <p className="text-muted-foreground">
          {queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue
        </p>
      </motion.div>

      {currentSong && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Now Playing</h2>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{currentSong.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
            </div>
            <span className="text-sm text-muted-foreground">{currentSong.duration}</span>
          </div>
        </div>
      )}

      {queue.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Next Up</h2>
          <div className="space-y-2">
            {queue.map((song, index) => (
              <motion.div
                key={`${song.id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 group"
              >
                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{song.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                <span className="text-sm text-muted-foreground">{song.duration}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => playSong(song)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => removeFromQueue(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Music2 className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg mb-2">Queue is empty</p>
          <p className="text-muted-foreground text-sm">Add songs to see them here</p>
        </div>
      )}
    </div>
  );
}
