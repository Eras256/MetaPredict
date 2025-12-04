# ✅ Solución al Error "Only core"

## Problema Resuelto

El error "Only core" ocurría porque el frontend estaba usando el Core Contract antiguo (`0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC`) en lugar del nuevo Core Contract corregido (`0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99`).

## Correcciones Aplicadas

### 1. Variables de Entorno Actualizadas
✅ `frontend/.env.local` actualizado con las nuevas direcciones:
- `NEXT_PUBLIC_CORE_CONTRACT_ADDRESS=0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99`
- `NEXT_PUBLIC_BINARY_MARKET_ADDRESS=0x68aEea03664707f152652F9562868CCF87C0962C`
- `NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS=0x547FC8C5680B7c4ed05da93c635B6b9B83e12007`
- `NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS=0x9a9c478BFdC45E2612f61726863AC1b6422217Ea`

### 2. Código del Frontend
✅ `frontend/lib/contracts/addresses.ts` ya tiene:
- Valores por defecto actualizados al nuevo Core Contract
- Detección automática de direcciones antiguas con reemplazo automático

## ⚠️ ACCIÓN REQUERIDA

**DEBES REINICIAR EL SERVIDOR DE DESARROLLO** para que los cambios surtan efecto:

```bash
# 1. Detén el servidor actual (Ctrl+C)

# 2. Limpia el caché de Next.js (opcional pero recomendado)
cd frontend
rm -rf .next

# 3. Reinicia el servidor
pnpm dev
```

## Verificación

Después de reiniciar, verifica en la consola del navegador que:
- No aparezcan advertencias sobre direcciones antiguas
- Las apuestas funcionen correctamente
- El error "Only core" desaparezca

## Nuevas Direcciones

```
Core Contract: 0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99
Binary Market: 0x68aEea03664707f152652F9562868CCF87C0962C
Conditional Market: 0x547FC8C5680B7c4ed05da93c635B6b9B83e12007
Subjective Market: 0x9a9c478BFdC45E2612f61726863AC1b6422217Ea
```

## Notas

- El nuevo Core Contract tiene la corrección del bug "Only core"
- Todos los contratos de mercado están correctamente vinculados
- Las apuestas fueron probadas exitosamente desde Hardhat
- El frontend ahora debería funcionar correctamente después del reinicio
