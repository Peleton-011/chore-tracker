export interface Toast {
  id: number
  message: string
  kind: 'info' | 'error'
  action?: { label: string; run: () => void }
}

let seq = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function push(message: string, kind: Toast['kind'] = 'info', action?: Toast['action'], ms = 4000) {
    const id = ++seq
    toasts.value = [...toasts.value, { id, message, kind, action }]
    setTimeout(() => dismiss(id), ms)
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
  return {
    toasts,
    dismiss,
    info: (m: string, action?: Toast['action']) => push(m, 'info', action, action ? 6000 : 3500),
    error: (e: unknown) => push(typeof e === 'string' ? e : errorMessage(e), 'error', undefined, 6000),
  }
}
