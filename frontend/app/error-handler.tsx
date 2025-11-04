'use client';

import { useEffect } from 'react';

// Componente para manejar errores de extensiones de Chrome
export function ErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Interceptar errores de extensiones de Chrome
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      
      // Ignorar errores de extensiones no autorizadas
      if (
        errorMessage.includes('has not been authorized yet') ||
        errorMessage.includes('chrome-extension://') ||
        errorMessage.includes('Extension context invalidated')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Interceptar errores no capturados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      
      // Ignorar errores de extensiones
      if (
        reason.includes('has not been authorized yet') ||
        reason.includes('chrome-extension://')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

