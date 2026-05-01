'use client'
import { useToastStore } from '@/store/toastStore'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80 pointer-events-auto transform transition-all duration-300 translate-y-0 opacity-100 flex items-start gap-4"
        >
           <div className="text-3xl">
             {toast.type === 'xp' && '⭐'}
             {toast.type === 'loot' && '💎'}
             {toast.type === 'pay' && '🪙'}
             {toast.type === 'level' && '🆙'}
             {toast.type === 'success' && '✅'}
             {toast.type === 'info' && '👋'}
           </div>
           <div className="flex-1 mt-0.5">
             <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">{toast.title}</h4>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">{toast.message}</p>
           </div>
           <button 
             onClick={() => removeToast(toast.id)} 
             className="text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center p-1 relative -top-1 -right-1"
           >
             ✕
           </button>
        </div>
      ))}
    </div>
  )
}
