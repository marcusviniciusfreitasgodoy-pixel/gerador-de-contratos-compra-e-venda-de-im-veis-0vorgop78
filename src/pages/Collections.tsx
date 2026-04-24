import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Plus, Download, Search, Settings2, MoreHorizontal, Braces } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const mockCollections = [
  {
    id: '1',
    name: 'users',
    type: 'Auth',
    docs: 1248,
    lastUpdated: '10 min atrás',
    status: 'active',
  },
  {
    id: '2',
    name: 'products',
    type: 'Public',
    docs: 342,
    lastUpdated: '2 horas atrás',
    status: 'active',
  },
  {
    id: '3',
    name: 'orders',
    type: 'Protected',
    docs: 89,
    lastUpdated: '1 hora atrás',
    status: 'active',
  },
  { id: '4', name: 'reviews', type: 'Public', docs: 412, lastUpdated: 'Ontem', status: 'active' },
  {
    id: '5',
    name: 'archived_logs',
    type: 'Private',
    docs: 8920,
    lastUpdated: '5 dias atrás',
    status: 'archived',
  },
]

const mockSchema = {
  users: [
    { name: 'id', type: 'UUID', required: true },
    { name: 'email', type: 'String', required: true },
    { name: 'full_name', type: 'String', required: false },
    { name: 'avatar_url', type: 'String', required: false },
    { name: 'created_at', type: 'DateTime', required: true },
  ],
}

export default function Collections() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

  const filteredCollections = mockCollections.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coleções de Dados</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as tabelas e esquemas do seu banco de dados.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Criar Nova Coleção
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar coleções..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-4 sm:pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead className="text-right">Documentos</TableHead>
                  <TableHead className="hidden md:table-cell">Atualização</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Database className="h-8 w-8 mb-2 opacity-20" />
                        <p>Nenhuma coleção encontrada.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((collection) => (
                    <TableRow
                      key={collection.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCollection(collection.name)}
                    >
                      <TableCell className="font-medium flex items-center gap-2">
                        <Braces className="h-4 w-4 text-muted-foreground" />
                        {collection.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            collection.type === 'Auth'
                              ? 'default'
                              : collection.type === 'Protected'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="font-normal"
                        >
                          {collection.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {collection.docs.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {collection.lastUpdated}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedCollection(collection.name)}
                            >
                              Ver Esquema
                            </DropdownMenuItem>
                            <DropdownMenuItem>Visualizar Dados</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedCollection}
        onOpenChange={(open) => !open && setSelectedCollection(null)}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Braces className="h-5 w-5 text-primary" />
              Esquema: {selectedCollection}
            </SheetTitle>
            <SheetDescription>
              Estrutura de dados e tipos de campos para esta coleção.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
            <div className="space-y-4">
              <div className="rounded-lg border bg-slate-950 p-4">
                <pre className="text-sm text-slate-50 font-mono overflow-x-auto">
                  <code>
                    {`model ${selectedCollection} {\n`}
                    {mockSchema.users.map(
                      (field) =>
                        `  ${field.name.padEnd(15)} ${field.type}${field.required ? '' : '?'}\n`,
                    )}
                    {`}`}
                  </code>
                </pre>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Campos</h4>
                {mockSchema.users.map((field, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-md bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">{field.name}</span>
                      {field.required && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      {field.type}
                    </span>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4" variant="outline">
                Editar Esquema
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
