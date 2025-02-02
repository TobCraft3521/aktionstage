// app/layout.tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
