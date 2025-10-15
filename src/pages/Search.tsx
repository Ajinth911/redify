import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SongCard } from '@/components/SongCard';
import { Song } from '@/contexts/MusicContext';
import { searchSongs } from '@/services/youtube';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (value.length > 2) {
      setLoading(true);
      try {
        const songs = await searchSongs(value, 24);
        setResults(songs);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 py-6"
      >
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-14 text-lg bg-secondary border-border focus:border-primary"
          />
        </div>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Search Results
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {results.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </div>
        </section>
      ) : query.length > 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <SearchIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">Start searching for your favorite music</p>
        </div>
      )}
    </div>
  );
}
