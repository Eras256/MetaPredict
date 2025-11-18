import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env from root directory
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * Script helper para obtener reportes de Chainlink Data Streams
 * 
 * Este script muestra cómo obtener reportes de la API de Data Streams
 * 
 * NOTA: Este es un script de ejemplo. Para producción, implementa esto en tu backend.
 */
async function main() {
  console.log("📡 Obteniendo reporte de Chainlink Data Streams...\n");

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("❌ Uso: pnpm ts-node scripts/get-data-streams-report.ts <STREAM_ID>");
    console.error("   Ejemplo: pnpm ts-node scripts/get-data-streams-report.ts 0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8");
    console.error("\n💡 Stream IDs disponibles:");
    console.error("   BTC/USD: 0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8");
    console.error("   ETH/USD: 0x000362205e10b3a147d02792eccee483dca6c7b44ecce7012cb8c6e0b68b3ae9");
    console.error("   BNB/USD: 0x000335fd3f3ffa06cfd9297b97367f77145d7a5f132e84c736cc471dd98621fe");
    process.exit(1);
  }

  const streamId = args[0];
  console.log("📊 Stream ID:", streamId, "\n");

  // Ejemplo de cómo obtener un reporte de Data Streams
  // NOTA: Esto requiere implementar la llamada real a la API
  console.log("📝 Para obtener un reporte real de Data Streams:");
  console.log("\n1. Consulta la API de Chainlink Data Streams:");
  console.log("   GET https://api.chain.link/data-streams/streams/{streamId}/reports/latest");
  console.log("\n2. O usa WebSocket para obtener reportes en tiempo real:");
  console.log("   wss://api.chain.link/data-streams/streams/{streamId}/reports");
  console.log("\n3. El reporte viene en formato binario que debes pasar a verifyPriceReport()");
  console.log("\n📚 Documentación:");
  console.log("   https://docs.chain.link/data-streams/streams-api-reference");
  console.log("\n💡 Ejemplo de código TypeScript:");
  console.log(`
import fetch from 'node-fetch';

async function getDataStreamsReport(streamId: string) {
  const response = await fetch(
    \`https://api.chain.link/data-streams/streams/\${streamId}/reports/latest\`,
    {
      headers: {
        'Accept': 'application/octet-stream',
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(\`Error obteniendo reporte: \${response.statusText}\`);
  }
  
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

// Usar el reporte
const report = await getDataStreamsReport(streamId);
const reportHex = '0x' + report.toString('hex');

// Pasar a verifyPriceReport()
await dataStreamsContract.verifyPriceReport(marketId, reportHex);
  `);

  console.log("\n✅ Script de ejemplo completado");
  console.log("💡 Implementa la obtención real de reportes en tu backend o frontend\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

