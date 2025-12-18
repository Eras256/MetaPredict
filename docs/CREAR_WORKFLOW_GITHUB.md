# Cómo Crear el Workflow de GitHub Actions

## Paso 1: Crear la estructura de carpetas

```bash
# Windows PowerShell
New-Item -Path .github\workflows -ItemType Directory -Force

# Linux/Mac
mkdir -p .github/workflows
```

## Paso 2: Crear el archivo del workflow

Crea el archivo `.github/workflows/resolve-markets.yml` con este contenido:

```yaml
name: Resolve Pending Markets

on:
  schedule:
    # Ejecutar cada 10 minutos como fallback si Gelato no funciona
    - cron: '*/10 * * * *'
  workflow_dispatch:  # Permite ejecución manual desde GitHub

jobs:
  resolve-markets:
    name: Resolve Pending Markets
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: |
          cd smart-contracts
          pnpm install

      - name: Resolve pending markets
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          RPC_URL_TESTNET: ${{ secrets.RPC_URL_TESTNET }}
          AI_ORACLE_ADDRESS: ${{ secrets.AI_ORACLE_ADDRESS }}
          BACKEND_URL: ${{ secrets.BACKEND_URL || 'https://www.metapredict.fun/api' }}
        run: |
          cd smart-contracts
          pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet

      - name: Report results
        if: always()
        run: |
          echo "✅ Script de resolución completado"
          echo "📊 Revisa los logs arriba para ver los resultados"
```

## Paso 3: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **"New repository secret"**
4. Agrega estos secrets:

### Secrets Requeridos:

#### `PRIVATE_KEY`
- **Valor**: Tu clave privada de la wallet (sin `0x` al inicio)
- **Ejemplo**: `2003f926c578fea4a77ffdd98a288a3297ee12b8893505562422dd258e4a5765`
- ⚠️ **IMPORTANTE**: Esta es tu clave privada, manténla segura

#### `RPC_URL_TESTNET`
- **Valor**: URL del RPC de opBNB Testnet
- **Ejemplo**: `https://opbnb-testnet-rpc.bnbchain.org`

#### `AI_ORACLE_ADDRESS`
- **Valor**: Dirección del contrato AIOracle
- **Ejemplo**: `0xA65bE35D25B09F7326ab154E154572dB90F67081`

### Secret Opcional:

#### `BACKEND_URL`
- **Valor**: URL de tu backend (si no se configura, usa el default)
- **Ejemplo**: `https://www.metapredict.fun/api`
- **Default**: `https://www.metapredict.fun/api`

## Paso 4: Activar GitHub Actions

1. Ve a tu repositorio → **Actions**
2. Si es la primera vez, haz clic en **"I understand my workflows, enable them"**
3. El workflow aparecerá como **"Resolve Pending Markets"**

## Paso 5: Probar el Workflow

### Ejecución Manual:

1. Ve a **Actions** → **"Resolve Pending Markets"**
2. Haz clic en **"Run workflow"**
3. Selecciona la rama (main/master)
4. Haz clic en **"Run workflow"**

### Ejecución Automática:

El workflow se ejecutará automáticamente cada 10 minutos.

## Verificar que Funciona

Después de ejecutarse, verás:

- ✅ **Estado**: Verde si funcionó, rojo si hubo errores
- 📊 **Logs**: Haz clic en el workflow para ver los detalles
- Deberías ver mensajes como:
  ```
  🔧 Resolviendo todos los mercados pendientes...
  ✅ Market #X resuelto exitosamente
  ```

## Troubleshooting

### Error: "PRIVATE_KEY not found"
- Verifica que hayas agregado el secret en GitHub Settings → Secrets

### Error: "Network opBNBTestnet not found"
- Verifica que `hardhat.config.ts` tenga la configuración de `opBNBTestnet`

### Error: "Insufficient funds"
- Asegúrate de que la wallet tenga suficiente BNB para gas

### El workflow no se ejecuta automáticamente
- Verifica que el cron esté correcto: `*/10 * * * *` (cada 10 minutos)
- Los workflows programados pueden tener un delay de hasta 10 minutos

## Estructura del Workflow

```
.github/
└── workflows/
    └── resolve-markets.yml  ← Este archivo
```

## Comandos Útiles

```bash
# Verificar que el archivo existe
ls .github/workflows/resolve-markets.yml

# Ver el contenido
cat .github/workflows/resolve-markets.yml

# Editar el archivo
code .github/workflows/resolve-markets.yml
```

## Notas Importantes

- ⚠️ El workflow usa la misma wallet que configuraste en `.env.local`
- 💰 Asegúrate de que la wallet tenga suficiente BNB para gas
- 📊 Los logs muestran qué mercados se resolvieron y cuáles fallaron
- 🔄 Si falla, revisa los logs para ver el error específico
- ⏰ El workflow se ejecuta cada 10 minutos automáticamente
- 🚀 También puedes ejecutarlo manualmente desde GitHub Actions

