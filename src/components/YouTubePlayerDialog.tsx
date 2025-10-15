import { Play } from 'lucide-react';
import { Song } from '@/contexts/MusicContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface YouTubePlayerDialogProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export const YouTubePlayerDialog = ({ song, isOpen, onClose }: YouTubePlayerDialogProps) => {
  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{song.title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${song.videoId}?autoplay=1&rel=0`}
            title={song.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm text-muted-foreground">{song.artist}</p>
            <p className="text-xs text-muted-foreground">{song.duration}</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close Player
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
