import { useEffect, useState } from "react";
import { CheckCircle, Info, X } from "lucide-react";
import { Button } from "./button";

type Toast = { id: number; message: string; type?: "success" | "info" | "error" };
const TOAST_EVENT = "medium-mobil-shop-toast";

export function showToast(message: string, type: Toast["type"] = "success") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Omit<Toast, "id">>).detail;
      const toast = { id: Date.now(), ...detail };
      setToasts((items) => [...items, toast]);
      setTimeout(() => setToasts((items) => items.filter((item) => item.id !== toast.id)), 3000);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex min-w-72 items-center gap-3 rounded-lg border bg-white p-3 shadow-soft">
          {toast.type === "error" ? <Info className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <Button variant="ghost" size="icon" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
