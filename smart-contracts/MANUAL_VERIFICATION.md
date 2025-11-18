# Guía de Verificación Manual de Contratos

## ⚠️ Problema con Verificación Automática

El error "General exception occured when attempting to insert record" puede ocurrir por varias razones:
- Problemas con importaciones de contratos externos (OpenZeppelin)
- Múltiples declaraciones de licencia SPDX
- Problemas temporales con la API de BSCScan/Etherscan

## ✅ Solución: Verificación Manual

### Paso 1: Obtener el archivo de compilación

El archivo de compilación se encuentra en:
```
smart-contracts/artifacts/build-info/
```

Busca el archivo que corresponde a tu contrato (ej: `InsurancePool.json`).

### Paso 2: Verificar en opBNBScan

1. Ve a la dirección del contrato en opBNBScan:
   - Insurance Pool: https://opbnb-testnet.bscscan.com/address/0x8826D17589F0baAC87044171F7d1F28c918b5998
   - Core: https://opbnb-testnet.bscscan.com/address/0x46Ca523e51783a378fBa0D06d05929652D04B19E
   - Reputation Staking: https://opbnb-testnet.bscscan.com/address/0x5bD292d4d7b205800a8351875B62ba047B691071
   - AI Oracle: https://opbnb-testnet.bscscan.com/address/0x9A9a15F8172Cb366450642F1756c44b57911cdbb
   - DAO Governance: https://opbnb-testnet.bscscan.com/address/0x5062EfD2cC8760D5B590C1b9Eb740Df2673E1917
   - Binary Market: https://opbnb-testnet.bscscan.com/address/0xB72EcDa4f600F5a5965C82eB421a551EdC8279D2
   - Conditional Market: https://opbnb-testnet.bscscan.com/address/0x1546F9800d28ddff94438A76C8445381E487E1a8
   - Subjective Market: https://opbnb-testnet.bscscan.com/address/0xdFa24C062fb6fFDBF8fe7431aD8EB2014E841ef2
   - OmniRouter: https://opbnb-testnet.bscscan.com/address/0x57439Fa61Ac189DD5fBFaA87113A70C70385cF64

2. Haz clic en **"Contract"** → **"Verify and Publish"**

3. Selecciona **"Via Standard JSON Input"**

4. Completa el formulario:
   - **Compiler Type**: `Solidity (Single file)` o `Solidity (Standard JSON Input)`
   - **Compiler Version**: `v0.8.24+commit.e11b9ed9` (o la versión que usaste)
   - **Open Source License Type**: `MIT`
   - **Optimization**: `Yes` (200 runs)
   - **EVM Version**: `paris`

5. **Copia el contenido del archivo JSON** desde `artifacts/build-info/[hash].json` y pégalo en el campo "Enter the Solidity Contract Code below"

6. **Ingresa los argumentos del constructor** (ABI-encoded):

   **Insurance Pool:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3,0x0000000000000000000000000000000000000000,"MetaPredict Insurance Shares","mpINS"
   ```

   **Reputation Staking:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3
   ```

   **AI Oracle:**
   ```
   0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000000000000000000000000000,0,"https://your-backend-url.com/api/oracle/resolve"
   ```

   **DAO Governance:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3,0x5bD292d4d7b205800a8351875B62ba047B691071
   ```

   **OmniRouter:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3
   ```

   **Binary Market:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3,0x8eC3829793D0a2499971d0D853935F17aB52F800
   ```

   **Conditional Market:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3,0x8eC3829793D0a2499971d0D853935F17aB52F800
   ```

   **Subjective Market:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3,0x8eC3829793D0a2499971d0D853935F17aB52F800,0x5062EfD2cC8760D5B590C1b9Eb740Df2673E1917
   ```

   **Prediction Market Core:**
   ```
   0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3,0xB72EcDa4f600F5a5965C82eB421a551EdC8279D2,0x1546F9800d28ddff94438A76C8445381E487E1a8,0xdFa24C062fb6fFDBF8fe7431aD8EB2014E841ef2,0x9A9a15F8172Cb366450642F1756c44b57911cdbb,0x5bD292d4d7b205800a8351875B62ba047B691071,0x8826D17589F0baAC87044171F7d1F28c918b5998,0x57439Fa61Ac189DD5fBFaA87113A70C70385cF64,0x5062EfD2cC8760D5B590C1b9Eb740Df2673E1917
   ```

7. Haz clic en **"Verify and Publish"**

## 📝 Notas

- Asegúrate de usar la misma versión del compilador que usaste para desplegar
- Los argumentos del constructor deben estar en el mismo orden que en el deployment
- Si hay errores, verifica que el archivo JSON esté completo y correcto

## 🔗 Referencias

- [BSCScan Contract Verification Guide](https://docs.bscscan.com/getting-started/verifying-contracts)
- [Hardhat Verification Documentation](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)

