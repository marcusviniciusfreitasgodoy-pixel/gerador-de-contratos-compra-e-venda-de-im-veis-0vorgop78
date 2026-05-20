import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, FilePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocumentInfo } from './dashboard-data'

export function PhaseCard({ doc }: { doc: DocumentInfo }) {
  const navigate = useNavigate()

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          doc.statusType === 'mandatory'
            ? 'bg-red-500'
            : doc.statusType === 'core'
              ? 'bg-amber-500'
              : doc.statusType === 'optional'
                ? 'bg-slate-300 dark:bg-slate-700'
                : 'bg-blue-500',
        )}
      />
      <CardHeader className="pb-3 pl-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{doc.title}</CardTitle>
            <CardDescription className="text-sm mt-1">{doc.subtitle}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 text-center px-3 py-1',
              doc.statusType === 'mandatory' &&
                'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 font-semibold',
              doc.statusType === 'core' &&
                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400 font-semibold',
              doc.statusType === 'optional' &&
                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 font-normal',
              doc.statusType === 'conditional' &&
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400 font-medium',
            )}
          >
            {doc.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pl-6">
        <p className="text-sm md:text-base leading-relaxed text-foreground/90">{doc.description}</p>
        <div className="mt-5 bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-lg flex items-start gap-3 border border-amber-100 dark:border-amber-900/40">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-full shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm block mb-0.5">
              Dica de Uso
            </span>
            <p className="text-sm text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
              {doc.tip}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-4 bg-muted/30 border-t border-border/50 pl-6">
        <Button
          onClick={() => navigate(`/contratos/novo?tipo=${doc.typeId}`)}
          className="w-full sm:w-auto font-medium shadow-sm"
          variant={
            doc.statusType === 'core' || doc.statusType === 'mandatory' ? 'default' : 'secondary'
          }
        >
          <FilePlus className="w-4 h-4 mr-2" />
          Gerar {doc.title}
        </Button>
      </CardFooter>
    </Card>
  )
}
