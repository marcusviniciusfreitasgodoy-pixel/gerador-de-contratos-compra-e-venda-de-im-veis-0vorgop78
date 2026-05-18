import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Home, FileText, History, Bot, UserCircle, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const navigation = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Novo Contrato', url: '/contratos/novo', icon: FileText },
  { title: 'Histórico', url: '/history', icon: History },
  { title: 'Análise IA', url: '/analysis', icon: Bot },
  { title: 'Meu Perfil', url: '/profile', icon: UserCircle },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex justify-center px-4 border-b border-sidebar-border bg-sidebar text-primary">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl uppercase tracking-wide">
          <div className="w-8 h-8 bg-secondary flex items-center justify-center rounded-sm text-primary">
            <span>G</span>
          </div>
          <span className="truncate">Prime Realty</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')}>
                  <Link to="/admin">
                    <Settings />
                    <span>Administrador</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserCircle className="w-4 h-4" />
          <span className="truncate font-medium">{user?.name || user?.email}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
