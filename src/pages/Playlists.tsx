import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListMusic, Trash2, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching playlists',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPlaylists(data || []);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setLoading(true);
    const { error } = await supabase.from('playlists').insert({
      user_id: user?.id,
      name: newPlaylistName,
      description: newPlaylistDesc || null,
    });

    if (error) {
      toast({
        title: 'Error creating playlist',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Playlist created!',
        description: `${newPlaylistName} has been created.`,
      });
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsDialogOpen(false);
      fetchPlaylists();
    }
    setLoading(false);
  };

  const deletePlaylist = async (id: string, name: string) => {
    const { error } = await supabase.from('playlists').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting playlist',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Playlist deleted',
        description: `${name} has been deleted.`,
      });
      fetchPlaylists();
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Playlists</h1>
          <p className="text-muted-foreground">
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
              />
              <Button onClick={createPlaylist} disabled={loading || !newPlaylistName.trim()} className="w-full">
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group cursor-pointer hover:bg-accent/50 transition-all">
                <CardContent className="p-4">
                  <div
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="flex flex-col items-center gap-3 mb-3"
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                      <ListMusic className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center w-full">
                      <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-xs text-muted-foreground truncate">{playlist.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id, playlist.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music2 className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg mb-2">No playlists yet</p>
          <p className="text-muted-foreground text-sm">Create your first playlist to get started</p>
        </div>
      )}
    </div>
  );
}
