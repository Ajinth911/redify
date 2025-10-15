import { motion } from 'framer-motion';
import { Clock, Music } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import { SongCard } from '@/components/SongCard';

export default function Library() {
  const { likedSongs } = useMusic();

  return (
    <div className="space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Your Library</h1>
        <p className="text-muted-foreground">
          {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
        </p>
      </motion.div>

      {likedSongs.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Music className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">All Songs</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {likedSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-20">
          <Clock className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg mb-2">Your library is empty</p>
          <p className="text-muted-foreground text-sm">
            Start adding songs to your library by liking them
          </p>
        </div>
      )}
    </div>
  );
}
