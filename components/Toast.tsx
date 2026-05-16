'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${typeStyles[type]}`}
      role="alert"
    >
      <span className="flex-1 text-sm">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="min-h-[44px] min-w-[44px] rounded p-2 hover:opacity-80"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

