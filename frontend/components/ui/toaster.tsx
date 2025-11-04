'use client';

import { toast, Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return <SonnerToaster theme="dark" position="top-right" richColors />;
}

export { toast };

