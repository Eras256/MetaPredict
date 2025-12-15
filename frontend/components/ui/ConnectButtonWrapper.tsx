'use client';

import { useEffect, useRef } from 'react';
import { ConnectButton, ConnectButtonProps } from 'thirdweb/react';

/**
 * Wrapper para ConnectButton que corrige el problema de botones anidados
 * Basado en la documentación oficial de thirdweb, este wrapper detecta y corrige
 * el botón de copiar anidado dentro del modal del ConnectButton
 */
export function ConnectButtonWrapper(props: ConnectButtonProps) {
  const processedButtonsRef = useRef<WeakSet<HTMLElement>>(new WeakSet());

  useEffect(() => {
    // Función para convertir un botón anidado en un div
    const convertButtonToDiv = (button: HTMLButtonElement): HTMLDivElement => {
      const div = document.createElement('div');
      
      // Copiar todos los atributos
      Array.from(button.attributes).forEach(attr => {
        if (attr.name !== 'type') {
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
      
      // Clonar el contenido (preservando event listeners de React)
      const clone = button.cloneNode(true) as HTMLElement;
      Array.from(clone.childNodes).forEach(node => {
        div.appendChild(node.cloneNode(true));
      });
      
      // Preservar el onClick original
      const originalClick = button.onclick;
      if (originalClick) {
        div.addEventListener('click', function(e) {
          e.stopPropagation();
          originalClick.call(button, e as any);
        });
      }
      
      // También intentar obtener el handler de React
      const reactFiber = (button as any).__reactFiber || (button as any)._reactInternalFiber;
      if (reactFiber?.memoizedProps?.onClick) {
        div.addEventListener('click', (e) => {
          e.stopPropagation();
          reactFiber.memoizedProps.onClick(e);
        });
      }
      
      // Disparar click en el botón original como fallback
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        button.click();
      }, true);
      
      // Soporte para teclado
      div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          div.click();
        }
      });
      
      return div;
    };

    // Función para corregir botones anidados en el modal
    const fixNestedButtons = () => {
      // Buscar el modal de thirdweb
      const modal = document.querySelector('[data-radix-dialog-content]') || 
                    document.querySelector('[role="dialog"]');
      
      if (!modal) return;

      // Buscar todos los botones en el modal
      const allButtons = Array.from(modal.querySelectorAll('button'));
      
      allButtons.forEach((button) => {
        // Buscar botones anidados (recursivamente)
        const findNestedButtons = (parent: HTMLElement): HTMLButtonElement[] => {
          const nested: HTMLButtonElement[] = [];
          const children = Array.from(parent.children);
          
          children.forEach(child => {
            if (child.tagName === 'BUTTON') {
              nested.push(child as HTMLButtonElement);
            } else if (child.children.length > 0) {
              nested.push(...findNestedButtons(child as HTMLElement));
            }
          });
          
          return nested;
        };
        
        const nestedButtons = findNestedButtons(button);
        
        nestedButtons.forEach(nestedButton => {
          // Evitar procesar el mismo botón múltiples veces
          if (processedButtonsRef.current.has(nestedButton)) {
            return;
          }
          
          // Verificar que realmente está anidado dentro de otro botón
          let parent = nestedButton.parentElement;
          while (parent && parent !== modal) {
            if (parent.tagName === 'BUTTON' && parent !== nestedButton) {
              // Este botón está anidado, convertirlo a div
              const div = convertButtonToDiv(nestedButton);
              nestedButton.replaceWith(div);
              processedButtonsRef.current.add(div as any);
              break;
            }
            parent = parent.parentElement;
          }
        });
      });
    };

    // Función para ejecutar la corrección con retry
    const executeFix = (retries = 3) => {
      const modal = document.querySelector('[data-radix-dialog-content]') || 
                    document.querySelector('[role="dialog"]');
      
      if (modal) {
        // Ejecutar inmediatamente
        fixNestedButtons();
        
        // Retry con delays para capturar renderizados asíncronos
        if (retries > 0) {
          setTimeout(() => executeFix(retries - 1), 100);
        }
      }
    };

    // Observar cambios en el DOM
    const observer = new MutationObserver(() => {
      executeFix(2);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Ejecutar inicialmente
    executeFix(3);

    return () => {
      observer.disconnect();
    };
  }, []);

  return <ConnectButton {...props} />;
}

