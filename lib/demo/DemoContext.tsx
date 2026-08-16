"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "personal-os-demo-mode";

const DemoContext = createContext<{ demo: boolean; toggle: () => void }>({
  demo: false,
  toggle: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setDemo(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setDemo((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return <DemoContext.Provider value={{ demo, toggle }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
