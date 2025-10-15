import { Outlet } from 'react-router-dom';
import { AppSidebar } from './Sidebar';
import { MusicPlayer } from './MusicPlayer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

export const Layout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-black/95 backdrop-blur px-4 lg:hidden">
            <SidebarTrigger className="hover:bg-secondary">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <h1 className="text-xl font-bold text-foreground">
              Retune
            </h1>
          </header>

          <main className="flex-1 p-8 lg:ml-0">
            <div className="max-w-screen-2xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
        
        <MusicPlayer />
      </div>
    </SidebarProvider>
  );
};
