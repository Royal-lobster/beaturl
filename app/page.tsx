"use client";

import { Sequencer } from "@/components/Sequencer";
import { ToastProvider } from "@/components/ui/toast";

export default function Home() {
  return (
    <ToastProvider position="bottom-center">
      <Sequencer />
    </ToastProvider>
  );
}
