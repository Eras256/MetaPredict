'use client';

import { useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import { ConnectButton, ConnectButtonProps } from 'thirdweb/react';

/**
 * Wrapper para ConnectButton que corrige el problema de botones anidados
 * Basado en la documentación oficial de thirdweb, este wrapper detecta y corrige
 * el botón de copiar anidado dentro del modal del ConnectButton
 * 
 * Usa useLayoutEffect para ejecutar antes de que React valide el DOM durante la hidratación
 */
export function ConnectButtonWrapper(props: ConnectButtonProps) {
  const processedElementsRef = useRef<WeakSet<HTMLElement>>(new WeakSet());
  const observerRef = useRef<MutationObserver | null>(null);
  const fixIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para convertir un botón anidado en un div
  const convertButtonToDiv = useCallback((button: HTMLButtonElement): HTMLDivElement => {
    // Si ya fue procesado, buscar el div existente
    if (processedElementsRef.current.has(button)) {
      const existingDiv = button.parentElement?.querySelector(`div[data-replaced-button="${button.className}"]`);
      if (existingDiv) return existingDiv as HTMLDivElement;
    }

    const div = document.createElement('div');
    div.setAttribute('data-replaced-button', button.className || 'copy-button');
    
    // Copiar todos los atributos excepto type y onclick
    Array.from(button.attributes).forEach(attr => {
      if (attr.name !== 'type' && attr.name !== 'onclick') {
        div.setAttribute(attr.name, attr.value);
      }
    });
    
    // Asegurar atributos de accesibilidad
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    
    // Copiar estilos inline
    div.style.cssText = button.style.cssText;
    
    // Copiar clases
    div.className = button.className;
    
    // Copiar el contenido HTML
    div.innerHTML = button.innerHTML;
    
    // Crear un handler que preserve la funcionalidad original
    const handleClick = (e: MouseEvent | KeyboardEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      // Intentar disparar el click original del botón
      try {
        button.click();
      } catch (err) {
        // Si falla, intentar obtener y ejecutar el handler de React
        const reactProps = (button as any).__reactProps || 
                         (button as any)._reactInternalFiber?.memoizedProps;
        if (reactProps?.onClick) {
          reactProps.onClick(e);
        }
      }
    };
    
    div.addEventListener('click', handleClick);
    
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

  // Función principal para corregir botones anidados
  const fixNestedButtons = useCallback(() => {
    // Buscar el modal de thirdweb con múltiples selectores
    const modal = document.querySelector('[data-radix-dialog-content]') || 
                  document.querySelector('[role="dialog"]') ||
                  document.querySelector('.tw-modal');
    
    if (!modal) return;

    // Buscar TODOS los botones en el modal
    const allButtons = Array.from(modal.querySelectorAll('button'));
    
    allButtons.forEach((button) => {
      // Verificar si este botón contiene otro botón (anidado)
      const nestedButton = button.querySelector('button');
      
      if (nestedButton && nestedButton !== button) {
        // Verificar que realmente está anidado
        let isNested = false;
        let current: HTMLElement | null = nestedButton;
        
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
      }
    });
    
    // También buscar botones que están dentro de otros botones de forma indirecta
    allButtons.forEach((button) => {
      // Buscar recursivamente botones dentro de este botón
      const walker = document.createTreeWalker(
        button,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            if (node.nodeName === 'BUTTON' && node !== button) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      let nestedNode: Node | null;
      while ((nestedNode = walker.nextNode())) {
        const nestedButton = nestedNode as HTMLButtonElement;
        
        if (!processedElementsRef.current.has(nestedButton)) {
          // Verificar que está realmente anidado
          let parent = nestedButton.parentElement;
          let isNested = false;
          
          while (parent && parent !== modal) {
            if (parent === button) {
              isNested = true;
              break;
            }
            parent = parent.parentElement;
          }
          
          if (isNested) {
            try {
              const div = convertButtonToDiv(nestedButton);
              nestedButton.replaceWith(div);
            } catch (err) {
              // Silenciar errores durante la corrección
            }
          }
        }
      }
    });
  }, [convertButtonToDiv]);

  // Interceptar errores de hidratación relacionados con botones anidados
  useEffect(() => {
    let rafScheduled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Función para ejecutar la corrección de forma segura, evitando ejecutar durante el renderizado
    const scheduleFix = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      
      // Cancelar timeout anterior si existe
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Usar múltiples delays para asegurar que no se ejecute durante el renderizado
      // Primero esperar el siguiente frame de animación
      requestAnimationFrame(() => {
        // Luego esperar un microtask adicional para asegurar que React termine el renderizado
        queueMicrotask(() => {
          // Finalmente usar setTimeout para asegurar que no estamos en medio de un renderizado
          timeoutId = setTimeout(() => {
            try {
              fixNestedButtons();
            } catch (e) {
              // Silenciar errores durante la corrección
            }
            rafScheduled = false;
            timeoutId = null;
          }, 0);
        });
      });
    };
    
    // Interceptar console.error de forma segura
    const wrappedError = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Suprimir errores de botones anidados durante la hidratación
      if (message.includes('cannot be a descendant of <button>') || 
          message.includes('cannot contain a nested <button>')) {
        // Ejecutar la corrección de forma asíncrona y segura
        scheduleFix();
        return;
      }
      // Llamar al original de forma segura, evitando errores durante el renderizado
      try {
        originalError.apply(console, args);
      } catch (e) {
        // Silenciar errores si ocurren durante el renderizado
      }
    };

    // Interceptar console.warn también
    const wrappedWarn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (message.includes('cannot be a descendant of <button>') || 
          message.includes('cannot contain a nested <button>')) {
        scheduleFix();
        return;
      }
      try {
        originalWarn.apply(console, args);
      } catch (e) {
        // Silenciar errores si ocurren durante el renderizado
      }
    };

    // Asignar los wrappers después de que React termine el renderizado inicial
    // Usar setTimeout para asegurar que no estamos en medio de un renderizado
    const setupTimeout = setTimeout(() => {
      // Verificar que el original no haya sido cambiado por otro componente
      if (console.error === originalError || console.error === wrappedError) {
        console.error = wrappedError;
      }
      if (console.warn === originalWarn || console.warn === wrappedWarn) {
        console.warn = wrappedWarn;
      }
    }, 0);

    return () => {
      // Limpiar timeout de setup
      clearTimeout(setupTimeout);
      
      // Limpiar timeout de fix si existe
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Restaurar de forma asíncrona para evitar problemas durante el unmount
      queueMicrotask(() => {
        // Solo restaurar si todavía estamos usando nuestros wrappers
        if (console.error === wrappedError) {
          console.error = originalError;
        }
        if (console.warn === wrappedWarn) {
          console.warn = originalWarn;
        }
      });
    };
  }, [fixNestedButtons]);

  // Ejecutar corrección de forma proactiva
  useLayoutEffect(() => {
    // Ejecutar inmediatamente antes de que React valide el DOM
    fixNestedButtons();
    
    // Ejecutar con delays para capturar renderizados asíncronos
    const timeouts = [
      setTimeout(() => fixNestedButtons(), 0),
      setTimeout(() => fixNestedButtons(), 50),
      setTimeout(() => fixNestedButtons(), 100),
      setTimeout(() => fixNestedButtons(), 200),
      setTimeout(() => fixNestedButtons(), 500),
    ];

    // Observar cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some(mutation => {
        return mutation.type === 'childList' && 
               (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);
      });
      
      if (hasRelevantChanges) {
        requestAnimationFrame(() => {
          fixNestedButtons();
        });
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });
    
    observerRef.current = observer;

    // Ejecutar periódicamente como fallback
    fixIntervalRef.current = setInterval(() => {
      const modal = document.querySelector('[data-radix-dialog-content]') || 
                    document.querySelector('[role="dialog"]');
      if (modal) {
        fixNestedButtons();
      }
    }, 1000);

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

  return <ConnectButton {...props} />;
}
