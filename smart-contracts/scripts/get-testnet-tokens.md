# 💧 Obtener Tokens Testnet Automáticamente

## 🎯 Wallet Configurado

Tu wallet de deployment está configurado. Para obtener tokens testnet, sigue estos pasos:

## 📋 Dirección de tu Wallet

Ejecuta este comando para ver tu dirección:

```bash
cd smart-contracts
npx ts-node scripts/setup-deployment-wallet.ts
```

Esto mostrará:
- Tu dirección de wallet
- Balance actual en testnet
- Links directos a los faucets

## 🔗 Faucets Disponibles (Noviembre 2025)

### Opción 1: L2Faucet (⭐ Más Rápido)

1. Visita: https://www.l2faucet.com/opbnb
2. Conecta tu wallet (MetaMask)
3. Asegúrate de estar en **opBNB Testnet** (Chain ID: 5611)
4. Pega tu dirección de wallet
5. Haz clic en "Request"
6. Recibirás **0.01 tBNB** en unos segundos

### Opción 2: Thirdweb Faucet

1. Visita: https://thirdweb.com/opbnb-testnet
2. Conecta tu wallet
3. Selecciona opBNB Testnet
4. Solicita tokens
5. Recibirás **0.01 tBNB**

### Opción 3: BNB Chain Faucet (Más cantidad, requiere bridge)

1. Visita: https://testnet.bnbchain.org/faucet-smart
2. Solicita tokens (recibirás en BSC Testnet)
3. Usa el bridge: https://testnet.bnbchain.org/bridge
4. Transfiere de BSC Testnet → opBNB Testnet
5. Recibirás **0.3 tBNB**

## ⚡ Script Automático (Próximamente)

Puedes usar el script de verificación para monitorear tu balance:

```bash
cd smart-contracts
npx ts-node scripts/setup-deployment-wallet.ts
```

Este script te mostrará:
- ✅ Si tu wallet está configurado correctamente
- ✅ Tu balance actual
- ✅ Si necesitas más tokens

## 📝 Notas

- Los faucets tienen límites de 24 horas
- Puedes usar múltiples faucets el mismo día
- Necesitas al menos 0.1 tBNB para deployment completo
- Los tokens testnet no tienen valor real

---

**Para más detalles**: Ver `FAUCETS_OPBNB.md`

