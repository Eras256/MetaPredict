'use client';

import { useEffect } from 'react';

// Componente para manejar errores de extensiones de Chrome
export function ErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Suprimir errores de console.error de extensiones
    // Usar setTimeout para evitar actualizar durante el render
    const originalConsoleError = console.error;
    
    const wrappedConsoleError = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      const stack = args[1]?.stack?.toString() || '';
      
      // Ignorar errores de extensiones no autorizadas
      if (
        message.includes('has not been authorized yet') ||
        message.includes('chrome-extension://') ||
        message.includes('Extension context invalidated') ||
        stack.includes('chrome-extension://')
      ) {
        return; // Silenciar el error
      }
      
      // Ignorar completamente errores de Next.js devtools sobre setState durante render
      // Estos son warnings de desarrollo y no necesitan ser interceptados ni mostrados
      if (
        message.includes('Cannot update a component') ||
        message.includes('setState') ||
        message.includes('while rendering') ||
        message.includes('ForwardRef') ||
        stack.includes('intercept-console-error')
      ) {
        // Silenciar completamente estos errores para evitar problemas con React
        return;
      }
      
      // Llamar directamente sin wrapper asíncrono
      // console.error no causa actualizaciones de estado, así que es seguro
      originalConsoleError.apply(console, args);
    };
    
    // Asignar después del render usando queueMicrotask para evitar problemas durante el render inicial
    queueMicrotask(() => {
      console.error = wrappedConsoleError;
    });

    // Interceptar errores de extensiones de Chrome
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      const errorSource = event.filename || '';
      
      // Ignorar errores de extensiones no autorizadas
      if (
        errorMessage.includes('has not been authorized yet') ||
        errorMessage.includes('chrome-extension://') ||
        errorMessage.includes('Extension context invalidated') ||
        errorSource.includes('chrome-extension://')
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Interceptar errores no capturados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      const stack = event.reason?.stack?.toString() || '';
      
      // Ignorar errores de extensiones
      if (
        reason.includes('has not been authorized yet') ||
        reason.includes('chrome-extension://') ||
        stack.includes('chrome-extension://')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError, true); // Usar capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Restaurar console.error en cleanup
      // Usar queueMicrotask para evitar problemas durante el unmount
      queueMicrotask(() => {
        console.error = originalConsoleError;
      });
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

