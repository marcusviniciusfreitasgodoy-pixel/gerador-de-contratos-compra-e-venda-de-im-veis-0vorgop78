import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className="bg-white flex flex-col h-full rounded-b-md min-h-[500px]">
      <div className="flex items-center gap-1 p-2 border-b bg-slate-50 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          type="button"
          title="Negrito"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          type="button"
          title="Itálico"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          type="button"
          title="Sublinhado"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          type="button"
          title="Lista"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          type="button"
          title="Lista Numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-6 focus:outline-none prose max-w-none text-slate-800 leading-relaxed"
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  )
}
