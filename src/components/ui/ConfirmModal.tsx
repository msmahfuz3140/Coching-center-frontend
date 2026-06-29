'use client'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmColor?: 'red' | 'amber' | 'emerald' | 'indigo'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const COLOR_MAP = {
  red:     { btn: 'bg-red-600 hover:bg-red-700',     icon: 'bg-red-100 text-red-600',     header: 'text-red-600' },
  amber:   { btn: 'bg-amber-600 hover:bg-amber-700', icon: 'bg-amber-100 text-amber-600', header: 'text-amber-600' },
  emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700', icon: 'bg-emerald-100 text-emerald-600', header: 'text-emerald-600' },
  indigo:  { btn: 'bg-indigo-600 hover:bg-indigo-700', icon: 'bg-indigo-100 text-indigo-600', header: 'text-indigo-600' },
}

const ICON_MAP = {
  red: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  amber: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  emerald: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  indigo: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', confirmColor = 'red', isLoading = false, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null

  const colors = COLOR_MAP[confirmColor]

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="px-6 pt-7 pb-4 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center mb-4`}>
            {ICON_MAP[confirmColor]}
          </div>
          <h3 className={`text-lg font-bold ${colors.header} mb-2`}>{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 mt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50 ${colors.btn}`}
          >
            {isLoading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
