"use client";

import { useState, useEffect, useCallback } from "react";

interface Toast {
  id: number;
  title: string;
  type?: string;
}

let addToast: (t: Omit<Toast, "id">) => void = () => {};

export const toastManager = {
  add(t: Omit<Toast, "id">) { addToast(t); },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2500);
  }, []);

  useEffect(() => { addToast = add; }, [add]);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.title}</div>
      ))}
    </div>
  );
}
