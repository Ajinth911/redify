import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Plus, ListPlus } from 'lucide-react';
import { Song } from '@/contexts/MusicContext';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SongCardProps {
  song: Song;
  index: number;
}

interface Playlist {
  id: string;
  name: string;
}

export const SongCard = ({ song, index }: SongCardProps) => {
  const { playSong, toggleLike, isLiked, addToQueue } = useMusic();
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    const { data } = await supabase
      .from('playlists')
      .select('id, name')
      .order('created_at', { ascending: false });
    
    if (data) {
      setPlaylists(data);
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    const { data: existingSongs } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingSongs && existingSongs.length > 0 
      ? existingSongs[0].position + 1 
      : 0;

    const { error } = await supabase.from('playlist_songs').insert({
      playlist_id: playlistId,
      song_data: song as any,
      position: nextPosition,
    });

    if (error) {
      toast({
        title: 'Error adding to playlist',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Added to playlist!',
        description: `${song.title} added to playlist`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-card rounded-lg p-4 cursor-pointer transition-all hover:bg-card/80"
      onClick={() => playSong(song)}
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                playSong(song);
              }}
            >
              <Play className="h-6 w-6" fill="currentColor" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song);
          }}
        >
          <Heart
            className={`h-5 w-5 ${isLiked(song.id) ? 'fill-primary text-primary' : 'text-foreground'}`}
          />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Add to...</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              addToQueue(song);
              toast({ title: 'Added to queue!' });
            }}>
              <ListPlus className="mr-2 h-4 w-4" />
              Queue
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <DropdownMenuItem
                  key={playlist.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToPlaylist(playlist.id);
                  }}
                >
                  {playlist.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No playlists</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
