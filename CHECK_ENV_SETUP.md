# Checklist: Actualización de PRIVATE_KEY

## ✅ Pasos completados:
1. ✅ PRIVATE_KEY actualizada en `env.example`

## ⚠️ Pasos pendientes:

### 1. Actualizar archivos .env reales
Los scripts leen desde `.env` y `.env.local` (no desde `env.example`):

```bash
# Copiar la nueva PRIVATE_KEY desde env.example a:
- .env (en la raíz del proyecto)
- .env.local (en la raíz del proyecto, tiene prioridad sobre .env)
```

**Orden de carga (hardhat.config.ts):**
1. `.env.local` (prioridad)
2. `.env` (fallback)

### 2. Verificar formato de PRIVATE_KEY
La PRIVATE_KEY debe ser:
- 64 caracteres hexadecimales
- Con o sin prefijo `0x` (ambos funcionan)
- Ejemplo válido: `271db1ec4312640590ff11be089b898d06dad7d875965d1bec1eeeceade44313`

### 3. Verificar saldo de la nueva wallet
La nueva wallet necesita saldo en opBNB Testnet para:
- Crear propuestas DAO (0.1 BNB cada una)
- Ejecutar transacciones (gas)
- Realizar pruebas

**Faucets disponibles:**
- L2Faucet: https://www.l2faucet.com/opbnb
- Thirdweb: https://thirdweb.com/opbnb-testnet
- BNB Chain: https://testnet.bnbchain.org/faucet-smart

### 4. Verificar que los scripts funcionen
Después de actualizar `.env` y `.env.local`, prueba:

```bash
# Verificar dirección de wallet
cd smart-contracts
node scripts/get-wallet-address.js

# Verificar propuestas (solo lectura, no requiere saldo)
npx hardhat run scripts/verify-dao-proposals.ts --network opBNBTestnet
```

### 5. Archivos que usan PRIVATE_KEY
Los siguientes scripts y configuraciones leen PRIVATE_KEY:
- `smart-contracts/hardhat.config.ts` - Configuración de redes
- `smart-contracts/scripts/deploy.ts` - Deployment de contratos
- `smart-contracts/scripts/create-more-dao-proposals.ts` - Crear propuestas
- `smart-contracts/scripts/test-dao-governance.ts` - Pruebas del contrato
- `smart-contracts/scripts/verify-dao-proposals.ts` - Verificar propuestas
- Todos los scripts de deployment y testing

## 🔍 Verificación rápida

Para verificar que todo está configurado correctamente:

1. **Ver dirección de wallet:**
   ```bash
   cd smart-contracts
   node scripts/get-wallet-address.js
   ```

2. **Verificar propuestas (solo lectura):**
   ```bash
   npx hardhat run scripts/verify-dao-proposals.ts --network opBNBTestnet
   ```

3. **Si necesitas crear más propuestas:**
   ```bash
   npx hardhat run scripts/create-more-dao-proposals.ts --network opBNBTestnet
   ```

## ⚠️ Importante
- **NUNCA** hagas commit de `.env` o `.env.local` con valores reales
- Estos archivos están en `.gitignore` por seguridad
- Solo `env.example` debe estar en el repositorio (con valores de ejemplo)

