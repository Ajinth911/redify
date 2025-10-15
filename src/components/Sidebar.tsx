import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, Music, X, ListMusic, LogOut, List } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { title: 'Home', path: '/', icon: Home },
  { title: 'Search', path: '/search', icon: Search },
  { title: 'Library', path: '/library', icon: Library },
  { title: 'Liked Songs', path: '/liked', icon: Heart },
  { title: 'Playlists', path: '/playlists', icon: ListMusic },
  { title: 'Queue', path: '/queue', icon: List },
];

export const AppSidebar = () => {
  const { setOpenMobile } = useSidebar();
  const { signOut } = useAuth();

  return (
    <Sidebar className="border-r border-border bg-black">
      <SidebarHeader className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              Redtune
            </h1>
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
            className="lg:hidden hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-secondary text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }`
                      }
                      onClick={() => setOpenMobile(false)}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                          <span>{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-border space-y-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            signOut();
            setOpenMobile(false);
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Powered by Ajinth
        </p>
      </SidebarFooter>
    </Sidebar>
  );
};
