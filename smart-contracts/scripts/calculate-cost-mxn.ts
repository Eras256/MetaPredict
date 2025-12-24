// Costo de las transacciones en MXN (Diciembre 2025)

// Datos de las transacciones
const COST_PER_TX_BNB = 0.00233818; // BNB por transacción
const TOTAL_COST_BNB = 0.00467636; // BNB total (2 transacciones)

// Precio de BNB en MXN (Diciembre 2025)
// Según búsqueda: 1 BNB ≈ 15,292 - 15,573 MXN
const BNB_PRICE_MXN = 15400; // Promedio aproximado

console.log("💰 Costo de Transacciones en Pesos Mexicanos (MXN)");
console.log("=".repeat(60));
console.log(`\n📊 Precio de BNB (Diciembre 2025): ${BNB_PRICE_MXN.toLocaleString('es-MX')} MXN\n`);

console.log("💸 Costo por Transacción:");
console.log(`   ${COST_PER_TX_BNB} BNB × ${BNB_PRICE_MXN.toLocaleString('es-MX')} MXN = ${(COST_PER_TX_BNB * BNB_PRICE_MXN).toFixed(2)} MXN`);

console.log("\n💸 Costo Total (2 transacciones):");
console.log(`   ${TOTAL_COST_BNB} BNB × ${BNB_PRICE_MXN.toLocaleString('es-MX')} MXN = ${(TOTAL_COST_BNB * BNB_PRICE_MXN).toFixed(2)} MXN`);

console.log("\n📈 Proyecciones:");
const marketsPerBNB = 1 / COST_PER_TX_BNB;
console.log(`   Mercados que puedes resolver con 1 BNB: ~${Math.floor(marketsPerBNB)}`);
console.log(`   Costo por mercado: ~${(COST_PER_TX_BNB * BNB_PRICE_MXN).toFixed(2)} MXN`);

const currentBalance = 0.687861242976517597;
const marketsWithCurrentBalance = Math.floor(currentBalance / COST_PER_TX_BNB);
console.log(`\n💳 Con tu balance actual (${currentBalance.toFixed(4)} BNB):`);
console.log(`   Puedes resolver ~${marketsWithCurrentBalance} mercados`);
console.log(`   Costo total estimado: ~${(marketsWithCurrentBalance * COST_PER_TX_BNB * BNB_PRICE_MXN).toFixed(2)} MXN`);

console.log("\n" + "=".repeat(60));

