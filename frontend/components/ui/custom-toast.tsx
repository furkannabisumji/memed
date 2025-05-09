"use client";

import React, { useState, useEffect, createContext, useContext } from "react";

// Define toast types
type ToastType = "success" | "error" | "info" | "warning";

// Define toast interface
interface Toast {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

// Define toast options interface to match Sonner API
interface ToastOptions {
  id?: string;
  description?: string;
  duration?: number;
  position?: string;
  className?: string;
}

// Create context for toast management
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id"> & { id?: string }) => void;
  removeToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id"> & { id?: string }) => {
      // Use a combination of timestamp and random string to ensure uniqueness
      const id =
        toast.id ||
        `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast = { ...toast, id };

      //  console.log("Adding toast:", newToast);
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after duration
      if (toast.duration !== 0) {
        const duration = toast.duration || 3000; // Reduced from 5000ms to 3000ms
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, dismissAll }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useCustomToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useCustomToast must be used within a ToastProvider");
  }

  // Define the toast function type with all its methods
  type ToastFunction = {
    (message: string, options?: ToastOptions): void;
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    dismiss: (id?: string) => void;
    dismissAll: () => void;
    loading: (message: string, options?: ToastOptions) => string;
  };

  // Create a base toast function that matches Sonner API
  const baseToast = (message: string, options?: ToastOptions) => {
    context.addToast({
      message,
      description: options?.description,
      type: "info",
      duration: options?.duration,
    });
  };

  // Add methods to the base toast function
  baseToast.success = (message: string, options?: ToastOptions) => {
    context.addToast({
      message,
      description: options?.description,
      type: "success",
      duration: options?.duration,
    });
  };

  baseToast.error = (message: string, options?: ToastOptions) => {
    context.addToast({
      message,
      description: options?.description,
      type: "error",
      duration: options?.duration,
    });
  };

  baseToast.info = (message: string, options?: ToastOptions) => {
    context.addToast({
      message,
      description: options?.description,
      type: "info",
      duration: options?.duration,
    });
  };

  baseToast.warning = (message: string, options?: ToastOptions) => {
    context.addToast({
      message,
      description: options?.description,
      type: "warning",
      duration: options?.duration,
    });
  };

  baseToast.dismiss = (id?: string) => {
    if (id) {
      context.removeToast(id);
    }
  };

  baseToast.dismissAll = () => {
    context.dismissAll();
  };

  // Add loading method to match Sonner API
  baseToast.loading = (message: string, options?: ToastOptions) => {
    // Use the same unique ID generation as in addToast
    const toastId =
      options?.id ||
      `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the toast object without the id first
    const toastData: Omit<Toast, "id"> = {
      message,
      description: options?.description,
      type: "info",
      duration: 0, // Don't auto-dismiss loading toasts
    };

    // Then add it with the id parameter
    context.addToast({
      ...toastData,
      id: toastId,
    });

    return toastId;
  };

  return baseToast as ToastFunction;
}

// Toast container component
function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-md shadow-lg py-2 px-3 flex items-center gap-2
            animate-in slide-in-from-right zoom-in-95 duration-300
            bg-white text-black
            transform transition-all hover:translate-x-0 translate-x-1
          `}
          style={{
            borderLeft: `3px solid ${
              toast.type === "success"
                ? "#10B981"
                : toast.type === "error"
                ? "#EF4444"
                : toast.type === "warning"
                ? "#F59E0B"
                : "#3B82F6"
            }`,
          }}
        >
          {/* Icon based on toast type */}
          <div className="flex-shrink-0">
            {toast.type === "success" && (
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {toast.type === "warning" && (
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {toast.type === "info" && (
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1 text-sm">
            <div className="font-medium">{toast.message}</div>
            {toast.description && (
              <div className="text-xs opacity-80">{toast.description}</div>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-black/70 hover:text-black ml-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
