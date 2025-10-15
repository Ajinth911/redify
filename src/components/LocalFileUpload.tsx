import { useState, useRef } from 'react';
import { Upload, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusic, Song } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';

export const LocalFileUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playSong } = useMusic();
  const { toast } = useToast();
  const [localSongs, setLocalSongs] = useState<Song[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSongs: Song[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        
        const song: Song = {
          id: `local-${Date.now()}-${i}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local File',
          thumbnail: '/placeholder.svg',
          duration: '0:00',
          videoId: url,
        };
        
        newSongs.push(song);
      }
    }

    if (newSongs.length > 0) {
      setLocalSongs([...localSongs, ...newSongs]);
      toast({
        title: 'Files added!',
        description: `${newSongs.length} audio ${newSongs.length === 1 ? 'file' : 'files'} ready to play`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-dashed border-2 hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-1">Upload Local Files</h3>
            <p className="text-sm text-muted-foreground">Add your own audio files to play</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </Card>

      {localSongs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Local Files ({localSongs.length})</h3>
          <div className="space-y-1">
            {localSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer group"
                onClick={() => playSong(song)}
              >
                <Music className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
