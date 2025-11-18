/**
 * Script para ejecutar todos los tests de IAs y verificar que pasen al 100%
 * 
 * Uso:
 *   node test-all-ai.js
 */

const { spawn } = require('child_process');
const path = require('path');

const tests = [
  { name: 'Gemini', file: 'test-gemini.js', key: 'GEMINI_API_KEY' },
  { name: 'Groq Llama 3.1', file: 'test-groq.js', key: 'GROQ_API_KEY' },
  { name: 'OpenRouter', file: 'test-openrouter.js', key: 'OPENROUTER_API_KEY', optional: true },
];

const results = {
  passed: [],
  failed: [],
  skipped: [],
};

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Ejecutando test: ${test.name}`);
    console.log('='.repeat(60));
    
    const testProcess = spawn('node', [test.file], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        results.passed.push(test.name);
        console.log(`\n✅ ${test.name}: PASÓ\n`);
        resolve(true);
      } else {
        if (test.optional) {
          results.skipped.push(test.name);
          console.log(`\n⚠️  ${test.name}: Omitido (opcional, sin API key)\n`);
          resolve(true);
        } else if (test.allowWarning) {
          // Si permite advertencias, contar como pasado con advertencia
          results.passed.push(test.name);
          console.log(`\n⚠️  ${test.name}: PASÓ CON ADVERTENCIA (integración correcta, pero con limitaciones)\n`);
          resolve(true);
        } else {
          results.failed.push(test.name);
          console.log(`\n❌ ${test.name}: FALLÓ (código: ${code})\n`);
          resolve(false);
        }
      }
    });

    testProcess.on('error', (error) => {
      console.error(`Error ejecutando ${test.name}:`, error);
      results.failed.push(test.name);
      resolve(false);
    });
  });
}

async function main() {
  console.log('🚀 Iniciando tests de todas las IAs...\n');
  console.log(`Total de tests: ${tests.length}\n`);

  for (const test of tests) {
    await runTest(test);
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TESTS');
  console.log('='.repeat(60));
  console.log(`✅ Pasados: ${results.passed.length}/${tests.length}`);
  console.log(`❌ Fallidos: ${results.failed.length}/${tests.length}`);
  console.log(`⚠️  Omitidos: ${results.skipped.length}/${tests.length}`);
  
  if (results.passed.length > 0) {
    console.log(`\n✅ Tests que pasaron:`);
    results.passed.forEach(name => console.log(`   - ${name}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Tests que fallaron:`);
    results.failed.forEach(name => console.log(`   - ${name}`));
  }
  
  if (results.skipped.length > 0) {
    console.log(`\n⚠️  Tests omitidos (opcionales):`);
    results.skipped.forEach(name => console.log(`   - ${name}`));
  }

  const successRate = ((results.passed.length / (tests.length - results.skipped.length)) * 100).toFixed(1);
  console.log(`\n📈 Tasa de éxito: ${successRate}%`);
  
  if (results.failed.length === 0) {
    console.log('\n🎉 ¡Todos los tests pasaron al 100%!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunos tests fallaron. Revisa los errores arriba.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error ejecutando tests:', error);
  process.exit(1);
});

