# ⚡ Quick Start - Deployment opBNB

## 🎯 Requisitos Mínimos

### 1. Variables de Entorno Esenciales

En tu `.env` (raíz del proyecto):

```env
# OBLIGATORIO
PRIVATE_KEY=tu_private_key_sin_0x
RPC_URL_TESTNET=https://opbnb-testnet-rpc.bnbchain.org
BSCSCAN_API_KEY=tu_api_key_de_bscscan

# OPCIONAL (pueden ser AddressZero para testnet)
CHAINLINK_FUNCTIONS_ROUTER=0x0000000000000000000000000000000000000000
VENUS_VTOKEN=0x0000000000000000000000000000000000000000
PANCAKE_ROUTER=0x0000000000000000000000000000000000000000
```

### 2. Fondos

- **Testnet**: 0.5-1 BNB testnet (obtén en [faucet](https://testnet.bnbchain.org/faucet-smart))
- **Mainnet**: 0.1-0.5 BNB real

### 3. Comandos Rápidos

```bash
# 1. Instalar dependencias
cd smart-contracts
pnpm install

# 2. Compilar
pnpm run compile

# 3. Desplegar en testnet
pnpm run deploy:testnet

# 4. Verificar contratos (después del deployment)
npx hardhat verify --network opBNBTestnet <CONTRACT_ADDRESS> <ARGS>
```

## 📝 Checklist Rápido

- [ ] `.env` configurado con `PRIVATE_KEY` y `RPC_URL_TESTNET`
- [ ] Wallet con BNB testnet
- [ ] `BSCSCAN_API_KEY` para verificación
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Contratos compilados (`pnpm run compile`)

## 🔗 Links Útiles

- **Faucets Testnet (Nov 2025)**:
  - L2Faucet (Recomendado): https://www.l2faucet.com/opbnb (0.01 tBNB/día, directo a opBNB)
  - Thirdweb: https://thirdweb.com/opbnb-testnet (0.01 tBNB/día)
  - BNB Chain: https://testnet.bnbchain.org/faucet-smart (0.3 tBNB/día, requiere bridge)
- **Explorer Testnet**: https://opbnb-testnet.bscscan.com
- **Explorer Mainnet**: https://opbnb.bscscan.com
- **BSCScan API**: https://bscscan.com/myapikey

## ⚠️ Notas Importantes

1. **PRIVATE_KEY**: NUNCA commitees esto. Usa una wallet dedicada.
2. **Testnet primero**: Siempre prueba en testnet antes de mainnet.
3. **Fondos limitados**: Usa una wallet con fondos mínimos necesarios.

---

Para más detalles, ver `DEPLOYMENT_GUIDE.md`

