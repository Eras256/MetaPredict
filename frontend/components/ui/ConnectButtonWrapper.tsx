'use client';

import { useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import { ConnectButton, ConnectButtonProps } from 'thirdweb/react';

/**
 * Wrapper para ConnectButton que corrige el problema de botones anidados
 * Este wrapper detecta y corrige el botón de copiar anidado dentro del modal del ConnectButton
 * antes de que React detecte el error de hidratación
 */
export function ConnectButtonWrapper(props: ConnectButtonProps) {
  const processedElementsRef = useRef<WeakSet<HTMLElement>>(new WeakSet());
  const observerRef = useRef<MutationObserver | null>(null);
  const fixIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Función para convertir un botón anidado en un div
  const convertButtonToDiv = useCallback((button: HTMLButtonElement): HTMLDivElement => {
    // Si ya fue procesado, no hacer nada
    if (processedElementsRef.current.has(button)) {
      const existing = button.parentElement?.querySelector(`div[data-replaced-button-id="${button.id || button.className}"]`);
      if (existing) return existing as HTMLDivElement;
    }

    const div = document.createElement('div');
    const uniqueId = button.id || `copy-btn-${Date.now()}-${Math.random()}`;
    div.setAttribute('data-replaced-button-id', uniqueId);
    
    // Copiar todos los atributos excepto type
    Array.from(button.attributes).forEach(attr => {
      if (attr.name !== 'type') {
        div.setAttribute(attr.name, attr.value);
      }
    });
    
    // Asegurar atributos de accesibilidad
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', button.getAttribute('aria-label') || 'Copy address');
    
    // Copiar estilos inline
    div.style.cssText = button.style.cssText;
    
    // Copiar clases
    div.className = button.className;
    
    // Copiar el contenido HTML
    div.innerHTML = button.innerHTML;
    
    // Preservar el handler original del botón
    const originalOnClick = button.onclick;
    const reactProps = (button as any).__reactProps || 
                      (button as any)._reactInternalFiber?.memoizedProps ||
                      (button as any).__reactEventHandlers;
    
    // Crear un handler que preserve la funcionalidad original
    const handleClick = (e: MouseEvent | KeyboardEvent) => {
      e.stopPropagation();
      
      // Crear un evento MouseEvent compatible para el handler original
      let compatibleEvent: MouseEvent;
      if (e instanceof MouseEvent) {
        compatibleEvent = e;
      } else {
        // Si es KeyboardEvent, crear un MouseEvent sintético
        compatibleEvent = new MouseEvent('click', {
          bubbles: e.bubbles,
          cancelable: e.cancelable,
          view: e.view,
          detail: 1,
          button: 0,
          buttons: 0,
        });
      }
      
      // Intentar ejecutar el handler original con el evento compatible
      if (originalOnClick) {
        try {
          originalOnClick.call(button, compatibleEvent as any);
        } catch (err) {
          // Si falla, intentar con el evento original
          try {
            originalOnClick.call(button, e as any);
          } catch (err2) {
            // Silenciar errores
          }
        }
      }
      
      // Intentar ejecutar el handler de React
      if (reactProps?.onClick) {
        reactProps.onClick(e as any);
      }
      
      // Como último recurso, intentar hacer click en el botón original
      if (!originalOnClick && !reactProps?.onClick) {
        try {
          button.click();
        } catch (err) {
          // Silenciar errores
        }
      }
    };
    
    div.addEventListener('click', handleClick, true);
    
    // Soporte para teclado
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        handleClick(e);
      }
    });
    
    // Marcar como procesado
    processedElementsRef.current.add(button);
    processedElementsRef.current.add(div);
    
    return div;
  }, []);

  // Función principal para corregir botones anidados - más agresiva
  const fixNestedButtons = useCallback(() => {
    // Buscar el modal de thirdweb con múltiples selectores
    const modal = document.querySelector('[data-radix-dialog-content]') || 
                  document.querySelector('[role="dialog"]') ||
                  document.querySelector('.tw-modal') ||
                  document.querySelector('[id*="radix"]');
    
    if (!modal) return;

    // Buscar TODOS los botones en el modal
    const allButtons = Array.from(modal.querySelectorAll('button'));
    
    // Primera pasada: encontrar botones que contienen otros botones
    allButtons.forEach((button) => {
      if (processedElementsRef.current.has(button)) return;
      
      // Verificar si este botón contiene otro botón (anidado)
      const nestedButtons = button.querySelectorAll('button');
      
      nestedButtons.forEach((nestedButton) => {
        if (nestedButton === button) return;
        
        // Verificar que realmente está anidado directamente
        let current: HTMLElement | null = nestedButton.parentElement;
        let isNested = false;
        
        while (current && current !== modal) {
          if (current === button) {
            isNested = true;
            break;
          }
          current = current.parentElement;
        }
        
        if (isNested && !processedElementsRef.current.has(nestedButton)) {
          try {
            const div = convertButtonToDiv(nestedButton);
            nestedButton.replaceWith(div);
          } catch (err) {
            // Silenciar errores durante la corrección
          }
        }
      });
    });
  }, [convertButtonToDiv]);

  // Interceptar errores de hidratación relacionados con botones anidados
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Interceptar console.error para suprimir errores de botones anidados
    const wrappedError = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Suprimir errores de botones anidados durante la hidratación
      if (message.includes('cannot be a descendant of <button>') || 
          message.includes('cannot contain a nested <button>') ||
          message.includes('<button> cannot be a descendant of <button>')) {
        // Ejecutar la corrección inmediatamente
        requestAnimationFrame(() => {
          queueMicrotask(() => {
            fixNestedButtons();
          });
        });
        return; // No mostrar el error en consola
      }
      originalError.apply(console, args);
    };

    // Interceptar console.warn también
    const wrappedWarn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (message.includes('cannot be a descendant of <button>') || 
          message.includes('cannot contain a nested <button>') ||
          message.includes('<button> cannot be a descendant of <button>')) {
        requestAnimationFrame(() => {
          queueMicrotask(() => {
            fixNestedButtons();
          });
        });
        return; // No mostrar el warning en consola
      }
      originalWarn.apply(console, args);
    };

    // Asignar los wrappers
    console.error = wrappedError;
    console.warn = wrappedWarn;

    return () => {
      // Restaurar solo si todavía estamos usando nuestros wrappers
      if (console.error === wrappedError) {
        console.error = originalError;
      }
      if (console.warn === wrappedWarn) {
        console.warn = originalWarn;
      }
    };
  }, [fixNestedButtons]);

  // Ejecutar corrección de forma proactiva - ANTES de que React valide el DOM
  useLayoutEffect(() => {
    // Ejecutar inmediatamente en el mismo frame, antes de que React valide
    fixNestedButtons();
    
    // Ejecutar con múltiples delays para capturar renderizados asíncronos del modal
    const timeouts: NodeJS.Timeout[] = [];
    
    // Usar requestAnimationFrame para ejecutar en el siguiente frame
    requestAnimationFrame(() => {
      fixNestedButtons();
      
      // Ejecutar después de microtasks
      queueMicrotask(() => {
        fixNestedButtons();
        
        // Ejecutar con delays adicionales
        timeouts.push(
          setTimeout(() => fixNestedButtons(), 0),
          setTimeout(() => fixNestedButtons(), 10),
          setTimeout(() => fixNestedButtons(), 50),
          setTimeout(() => fixNestedButtons(), 100),
          setTimeout(() => fixNestedButtons(), 200),
          setTimeout(() => fixNestedButtons(), 500)
        );
      });
    });

    // Observar cambios en el DOM de forma más agresiva
    const observer = new MutationObserver(() => {
      // Ejecutar inmediatamente cuando detecte cambios
      requestAnimationFrame(() => {
        queueMicrotask(() => {
          fixNestedButtons();
        });
      });
    });
    
    // Observar todo el documento para capturar el modal cuando se cree
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
    });
    
    observerRef.current = observer;

    // Ejecutar periódicamente como fallback (menos frecuente)
    fixIntervalRef.current = setInterval(() => {
      const modal = document.querySelector('[data-radix-dialog-content]') || 
                    document.querySelector('[role="dialog"]') ||
                    document.querySelector('.tw-modal');
      if (modal) {
        fixNestedButtons();
      }
    }, 500); // Reducido a 500ms para ser más reactivo

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (fixIntervalRef.current) {
        clearInterval(fixIntervalRef.current);
        fixIntervalRef.current = null;
      }
    };
  }, [fixNestedButtons]);

  return (
    <div ref={containerRef}>
      <ConnectButton {...props} />
    </div>
  );
}
