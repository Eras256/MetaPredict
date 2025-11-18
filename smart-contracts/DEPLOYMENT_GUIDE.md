# 🚀 Guía de Deployment - opBNB

## 📋 Requisitos Previos

### 1. Variables de Entorno

Crea o actualiza tu archivo `.env` en la raíz del proyecto con:

```env
# ============================================
# WALLET Y SEGURIDAD
# ============================================
# ⚠️ IMPORTANTE: Usa una wallet dedicada solo para deployment
# ⚠️ NUNCA uses tu wallet principal con todos tus fondos
PRIVATE_KEY=tu_private_key_aqui_sin_0x

# ============================================
# RPC ENDPOINTS
# ============================================
# Testnet
RPC_URL_TESTNET=https://opbnb-testnet-rpc.bnbchain.org
# Mainnet
RPC_URL=https://opbnb-mainnet-rpc.bnbchain.org

# ============================================
# VERIFICACIÓN DE CONTRATOS
# ============================================
# Obtén tu API key en: https://bscscan.com/myapikey
BSCSCAN_API_KEY=tu_bscscan_api_key_aqui

# ============================================
# DIRECCIONES DE CONTRATOS EXTERNOS (opBNB)
# ============================================

# Chainlink Functions (opBNB Testnet)
CHAINLINK_FUNCTIONS_ROUTER=0x0000000000000000000000000000000000000000
CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID=0
CHAINLINK_FUNCTIONS_DON_ID=0x0000000000000000000000000000000000000000000000000000000000000000

# Chainlink CCIP (Cross-Chain)
CHAINLINK_CCIP_ROUTER=0x0000000000000000000000000000000000000000
LINK_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000

# Pyth Oracle (opBNB)
PYTH_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000

# Venus Protocol (opBNB) - Para yield del Insurance Pool
VENUS_VTOKEN=0x0000000000000000000000000000000000000000
VENUS_VUSDC_ADDRESS=0x0000000000000000000000000000000000000000

# PancakeSwap Router (opBNB)
PANCAKE_ROUTER=0x0000000000000000000000000000000000000000

# USDC Token (opBNB)
USDC_ADDRESS=0x0000000000000000000000000000000000000000

# Backend URL (para Chainlink Functions)
BACKEND_URL=https://your-backend-url.com/api/oracle/resolve
```

### 2. Fondos Necesarios

#### Testnet (opBNB Testnet)
- **tBNB (Testnet BNB)**: Obtén en uno de estos faucets (Noviembre 2025):
  
  **Opción 1: L2Faucet (Recomendado - Directo a opBNB)**
  - URL: https://www.l2faucet.com/opbnb
  - Cantidad: 0.01 tBNB cada 24 horas
  - Ventaja: Deposita directamente en opBNB testnet
  
  **Opción 2: Thirdweb Faucet**
  - URL: https://thirdweb.com/opbnb-testnet
  - Cantidad: 0.01 tBNB por día
  - Ventaja: Rápido y confiable
  
  **Opción 3: BNB Chain Faucet Oficial (Requiere Bridge)**
  - URL: https://testnet.bnbchain.org/faucet-smart
  - Cantidad: 0.3 tBNB diariamente
  - Nota: Deposita en BSC Testnet, necesitas hacer bridge a opBNB
  
- **Cantidad recomendada**: 0.5-1 tBNB (puedes usar múltiples faucets)
- **Para qué**: Gas fees para deployment y testing

#### Mainnet (opBNB Mainnet)
- **BNB**: Necesitas BNB real en opBNB
- **Cantidad recomendada**: 0.1-0.5 BNB (depende de la complejidad)
- **Para qué**: Gas fees para deployment

### 3. Instalación de Dependencias

```bash
cd smart-contracts
pnpm install
# o
npm install
```

## 🔧 Compilación

### Compilar Contratos

```bash
cd smart-contracts
pnpm run compile
# o
npm run compile
```

Esto generará los artifacts en `artifacts/` y el cache en `cache/`.

### Verificar Compilación

```bash
# Verificar que no hay errores
pnpm run compile 2>&1 | grep -i error
```

## 🚀 Deployment

### 1. Deployment en Testnet

```bash
cd smart-contracts
pnpm run deploy:testnet
# o
npm run deploy:testnet
```

**Nota**: Asegúrate de que `PRIVATE_KEY` y `RPC_URL_TESTNET` estén configurados en tu `.env`.

### 2. Deployment en Mainnet

```bash
cd smart-contracts
pnpm run deploy:mainnet
# o
npm run deploy:mainnet
```

**⚠️ ADVERTENCIA**: 
- Verifica que tienes fondos suficientes
- Revisa el código antes de desplegar
- Usa una wallet dedicada con fondos limitados
- Considera desplegar primero en testnet

### 3. Deployment Manual con Hardhat

```bash
# Testnet
npx hardhat run scripts/deploy.ts --network opBNBTestnet

# Mainnet
npx hardhat run scripts/deploy.ts --network opBNBMainnet
```

## ✅ Verificación de Contratos

Después del deployment, verifica los contratos en BSCScan:

```bash
# Verificar un contrato específico
npx hardhat verify --network opBNBMainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Ejemplo:
npx hardhat verify --network opBNBMainnet 0x1234... "arg1" "arg2"
```

### Verificación Automática

Puedes agregar verificación automática en tu script de deployment.

## 📝 Checklist Pre-Deployment

- [ ] Variables de entorno configuradas (`.env`)
- [ ] Wallet con fondos suficientes
- [ ] Contratos compilados sin errores
- [ ] Tests pasando (`pnpm run test`)
- [ ] Scripts de deployment revisados
- [ ] Direcciones de contratos externos verificadas
- [ ] API key de BSCScan configurada
- [ ] Backup de private keys en lugar seguro

## 🔍 Verificación Post-Deployment

1. **Verificar en Explorer**:
   - Testnet: https://opbnb-testnet.bscscan.com
   - Mainnet: https://opbnb.bscscan.com

2. **Verificar Funcionalidad**:
   - Interactuar con contratos desplegados
   - Verificar eventos emitidos
   - Probar funciones principales

3. **Guardar Direcciones**:
   - Guarda todas las direcciones de contratos desplegados
   - Actualiza tu `.env` con las direcciones reales
   - Documenta en tu README o documentación

## 🛠️ Troubleshooting

### Error: "insufficient funds"
- **Solución**: Asegúrate de tener suficiente BNB en tu wallet

### Error: "nonce too high"
- **Solución**: Resetea el nonce o espera un momento

### Error: "contract verification failed"
- **Solución**: Verifica que `BSCSCAN_API_KEY` sea correcta
- Verifica que los argumentos del constructor sean correctos

### Error: "RPC endpoint not responding"
- **Solución**: Verifica que `RPC_URL` sea correcta
- Prueba con un endpoint alternativo

## 📚 Recursos Útiles

- **opBNB Docs**: https://docs.opbnb.io/
- **BSCScan opBNB**: https://opbnb.bscscan.com
- **Hardhat Docs**: https://hardhat.org/docs
- **Faucets Testnet (Noviembre 2025)**:
  - L2Faucet (Directo opBNB): https://www.l2faucet.com/opbnb
  - Thirdweb Faucet: https://thirdweb.com/opbnb-testnet
  - BNB Chain Faucet: https://testnet.bnbchain.org/faucet-smart

## 🔐 Seguridad

1. **NUNCA** commitees tu `.env` con valores reales
2. **USA** una wallet dedicada solo para deployment
3. **LIMITA** los fondos en la wallet de deployment
4. **GUARDA** private keys en un gestor de secretos seguro
5. **VERIFICA** todos los contratos antes de interactuar con ellos
6. **AUDITA** el código antes de deployment en mainnet

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Hardhat
2. Verifica la configuración de red
3. Consulta la documentación de opBNB
4. Revisa los issues en GitHub

---

**Última actualización**: Noviembre 2025

