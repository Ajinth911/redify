import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SongCard } from '@/components/SongCard';
import { LocalFileUpload } from '@/components/LocalFileUpload';
import { Song } from '@/contexts/MusicContext';
import { getTrending, getRecommendations } from '@/services/youtube';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [forYou, setForYou] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true);
      try {
        const [trending, newMusic, recommended] = await Promise.all([
          getTrending(18),
          getRecommendations('new music 2024', 12),
          getRecommendations('top hits 2024', 12),
        ]);
        setTrendingSongs(trending);
        setNewReleases(newMusic);
        setForYou(recommended);
      } catch (error) {
        console.error('Failed to fetch music:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Local File Upload */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LocalFileUpload />
      </motion.section>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 rounded-2xl overflow-hidden bg-gradient-hero"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-bold text-foreground"
            >
              Welcome to <span className="text-primary">Redtune</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Stream millions of songs powered by YouTube Music
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Trending Now */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-foreground mb-6"
        >
          Trending Now
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {trendingSongs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} />
          ))}
        </div>
      </section>

      {/* New Releases */}
      {newReleases.length > 0 && (
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-foreground mb-6"
          >
            New Releases
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {newReleases.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* For You */}
      {forYou.length > 0 && (
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-foreground mb-6"
          >
            Made For You
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {forYou.map((song, index) => (
              <SongCard key={`foryou-${song.id}`} song={song} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
