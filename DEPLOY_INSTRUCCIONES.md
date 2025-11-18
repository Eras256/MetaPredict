# 🚀 Instrucciones para Desplegar en Vercel

## ⚠️ Problema de Permisos

El deploy desde CLI requiere que el usuario tenga acceso al proyecto `metapredict` en el equipo `Vaiosx's projects`.

## ✅ Solución: Desplegar desde Vercel Dashboard

### Opción 1: Desplegar desde el Dashboard (Recomendado)

1. **Ve a**: https://vercel.com/vaiosxs-projects/metapredict/deployments
2. **Haz clic en "Redeploy"** en el último deployment
3. **O crea un nuevo deployment** desde la pestaña "Deployments"

### Opción 2: Desplegar desde Git (Automático)

Si el proyecto está conectado a Git:
1. **Haz commit y push** de los cambios:
   ```bash
   git add .
   git commit -m "Fix: Update markets hook with correct ABIs"
   git push
   ```
2. **Vercel desplegará automáticamente** cuando detecte el push

### Opción 3: Solucionar Permisos en CLI

Si quieres usar CLI, necesitas:
1. **Asegurarte de estar autenticado** con la cuenta correcta
2. **Verificar que tienes acceso** al proyecto `metapredict` en el equipo
3. **O usar un token de acceso** con los permisos correctos

## 📋 Variables de Entorno Verificadas

Todas las variables de entorno están configuradas correctamente en **Production**:

✅ `NEXT_PUBLIC_CORE_CONTRACT_ADDRESS` = `0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC`
✅ `NEXT_PUBLIC_BINARY_MARKET_ADDRESS` = `0x44bF3De950526d5BDbfaA284F6430c72Ea99163B`
✅ `NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS` = `0x45E223eAB99761A7E60eF7690420C178FEBD23df`
✅ `NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS` = `0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE`

## 🎯 Proyecto Correcto

- **Proyecto**: `metapredict`
- **Equipo**: `vaiosxs-projects`
- **URL de Producción**: https://metapredict-qs367tbku-vaiosxs-projects.vercel.app
- **Dominio Personalizado**: https://metapredic-bnb.vercel.app

## 📝 Cambios Listos para Desplegar

1. ✅ Hook `useMarkets` actualizado con ABIs correctos
2. ✅ Actualización automática de mercados al crear
3. ✅ Soporte completo para los 3 tipos de mercados
4. ✅ Logs de debugging agregados

**Todo está listo, solo necesitas hacer el deploy desde el dashboard de Vercel.**

