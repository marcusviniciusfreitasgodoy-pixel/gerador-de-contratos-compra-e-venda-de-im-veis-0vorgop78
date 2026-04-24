import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import pb from '@/lib/pocketbase/client'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo à sua nova aplicação!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status do Sistema
            </CardTitle>
            <LayoutDashboard className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">Online</div>
            <p className="text-xs text-muted-foreground mt-1">Conectado ao Skip Cloud</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seu Perfil</CardTitle>
            <User className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-12 border">
              <AvatarImage
                src={user?.avatar ? pb.files.getURL(user, user.avatar) : ''}
                alt={user?.name}
              />
              <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
