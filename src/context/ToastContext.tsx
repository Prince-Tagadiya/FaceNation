import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] p-4 rounded-lg shadow-2xl flex items-start gap-3 animate-in slide-in-from-right fade-in duration-300 border backdrop-blur-md ${
                            toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                            toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                            'bg-blue-500/10 border-blue-500/50 text-blue-500'
                        }`}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
                        {toast.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
                        {toast.type === 'info' && <Info size={20} className="shrink-0" />}
                        
                        <div className="flex-1 text-sm font-medium">{toast.message}</div>
                        
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
