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
  Building2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const customLogoUrl = user?.imobiliaria_logo ? pb.files.getURL(user, user.imobiliaria_logo) : null
  const brandName = user?.imobiliaria_nome || 'Godoy Prime Realty'

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border bg-sidebar text-white">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 overflow-hidden w-full transition-opacity hover:opacity-80"
        >
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt={brandName}
              className="h-8 w-auto object-contain max-w-full"
            />
          ) : (
            <>
              <Building2 className="h-6 w-6 shrink-0 text-white/90" />
              <span className="font-bold truncate text-sm">{brandName}</span>
            </>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Operacional */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-1">
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
                    <span>Novo Documento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/contratos'}>
                  <Link to="/contratos">
                    <Files />
                    <span>Meus Documentos</span>
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
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-1 mt-4">
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
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-1 mt-4">
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
        <div className="flex items-center gap-2 text-sm text-white/80">
          <UserCircle className="w-4 h-4" />
          <span className="truncate font-medium">{user?.name || user?.email}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
