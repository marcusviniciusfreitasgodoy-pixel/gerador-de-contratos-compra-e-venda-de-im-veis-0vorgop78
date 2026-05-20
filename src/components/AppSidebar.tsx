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
import {
  Home,
  FileText,
  History,
  Bot,
  UserCircle,
  Settings,
  Files,
  Scale,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

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
        {/* Operacional */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
            Operacional
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <Link to="/">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/contratos/novo'}>
                  <Link to="/contratos/novo">
                    <FileText />
                    <span>Novo Contrato</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/contratos'}>
                  <Link to="/contratos">
                    <Files />
                    <span>Meus Contratos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/analysis'}>
                  <Link to="/analysis">
                    <Bot />
                    <span>Análise IA</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Compliance & Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1 mt-4">
            Compliance & Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/knowledge'}>
                  <Link to="/admin/knowledge">
                    <Scale />
                    <span>Base Jurídica</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/audit-logs'}>
                  <Link to="/admin/audit-logs">
                    <ShieldAlert />
                    <span>Histórico de Auditoria</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/history'}>
                  <Link to="/history">
                    <History />
                    <span>Histórico de Análises</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1 mt-4">
            Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/profile'}>
                  <Link to="/profile">
                    <UserCircle />
                    <span>Perfil & Branding</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link to="/admin">
                    <Settings />
                    <span>Painel Administrativo</span>
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
