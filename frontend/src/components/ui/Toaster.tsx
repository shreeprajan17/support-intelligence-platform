import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ToastEntry } from '../../lib/toast.ts'
import { toast } from '../../lib/toast.ts'

function ToastItem({ entry }: { entry: ToastEntry }) {
  const isSuccess = entry.type === 'success'
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl px-4 py-3 shadow-lg border ${
        isSuccess
          ? 'bg-white border-emerald-200'
          : 'bg-white border-red-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <span className="text-sm text-gray-700 leading-snug">{entry.message}</span>
    </div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  useEffect(() => {
    return toast._subscribe(ts => setToasts([...ts]))
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(entry => (
        <ToastItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
