import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Trash2, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic, Song } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
}

interface PlaylistSong {
  id: string;
  song_data: Song;
  position: number;
}

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const { user } = useAuth();
  const { playSong } = useMusic();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && id) {
      fetchPlaylist();
      fetchSongs();
    }
  }, [user, id]);

  const fetchPlaylist = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error fetching playlist',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/playlists');
    } else {
      setPlaylist(data);
    }
  };

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select('*')
      .eq('playlist_id', id)
      .order('position', { ascending: true });

    if (error) {
      toast({
        title: 'Error fetching songs',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSongs((data || []) as unknown as PlaylistSong[]);
    }
  };

  const removeSong = async (songId: string) => {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('id', songId);

    if (error) {
      toast({
        title: 'Error removing song',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Song removed',
        description: 'Song removed from playlist',
      });
      fetchSongs();
    }
  };

  if (!playlist) return null;

  return (
    <div className="space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" onClick={() => navigate('/playlists')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playlists
        </Button>

        <div className="flex items-start gap-6">
          <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
            <ListMusic className="h-24 w-24 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground mb-4">{playlist.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>
      </motion.div>

      {songs.length > 0 ? (
        <div className="space-y-2">
          {songs.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 group"
            >
              <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
              <img
                src={item.song_data.thumbnail}
                alt={item.song_data.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{item.song_data.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{item.song_data.artist}</p>
              </div>
              <span className="text-sm text-muted-foreground">{item.song_data.duration}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => playSong(item.song_data)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => removeSong(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No songs in this playlist yet</p>
        </div>
      )}
    </div>
  );
}
