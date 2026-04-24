import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  LayoutDashboard,
  Database,
  Shield,
  Settings,
  Activity,
  Cloud,
  Search,
  Bell,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Coleções', href: '/collections', icon: Database },
  { name: 'Autenticação', href: '/auth', icon: Shield },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Logs', href: '/logs', icon: Activity },
]

export default function Layout() {
  const location = useLocation()

  const currentNav = navigation.find((item) => item.href === location.pathname) || navigation[0]

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/50">
        <SidebarHeader className="p-4 flex flex-row items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cloud className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-base">Skip Cloud</span>
            <span className="text-xs text-muted-foreground">Painel de Controle</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className="transition-all duration-200"
                >
                  <Link to={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-slate-50/50 dark:bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Skip Cloud</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {location.pathname !== '/' && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentNav.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Conectado ao Skip Cloud
            </div>

            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar recursos..."
                className="w-full rounded-full bg-muted/50 pl-8 focus-visible:bg-background"
              />
            </div>

            <button className="rounded-full p-2 hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <Avatar className="h-8 w-8 cursor-pointer border border-border/50">
              <AvatarImage
                src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1"
                alt="User"
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
