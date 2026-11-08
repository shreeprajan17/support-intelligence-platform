export type ToastType = 'success' | 'error'

export interface ToastEntry {
  id: string
  message: string
  type: ToastType
}

type Listener = (toasts: readonly ToastEntry[]) => void

let _toasts: ToastEntry[] = []
const _listeners = new Set<Listener>()

function _notify() {
  _listeners.forEach(fn => fn(_toasts))
}

function _add(message: string, type: ToastType) {
  const id = crypto.randomUUID()
  _toasts = [..._toasts, { id, message, type }]
  _notify()
  setTimeout(() => {
    _toasts = _toasts.filter(t => t.id !== id)
    _notify()
  }, 4000)
}

export const toast = {
  success: (message: string) => _add(message, 'success'),
  error: (message: string) => _add(message, 'error'),
  _subscribe: (fn: Listener): (() => void) => {
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  },
}
