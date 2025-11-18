/**
 * Test completo del sistema de consenso multi-IA
 * 
 * Uso:
 *   node test-consensus.js
 * 
 * Prueba:
 * 1. Cada IA individualmente
 * 2. El sistema de consenso completo
 * 3. El orden de prioridades
 * 4. El fallback automático
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { ConsensusService } = require('./dist/services/llm/consensus.service');
const { GoogleService } = require('./dist/services/llm/google.service');
const { GroqService } = require('./dist/services/llm/groq.service');
const { HuggingFaceService } = require('./dist/services/llm/huggingface.service');
const { OpenAIService } = require('./dist/services/llm/openai.service');
const { AnthropicService } = require('./dist/services/llm/anthropic.service');

// Test question
const TEST_QUESTION = 'Will Bitcoin reach $100,000 by the end of 2025?';
const TEST_CONTEXT = 'Bitcoin is currently trading around $60,000. Historical data shows strong growth patterns.';

async function testIndividualAIs() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 1: Probando cada IA individualmente');
  console.log('='.repeat(60) + '\n');

  const results = {
    gemini: { passed: false, error: null },
    groq: { passed: false, error: null },
    huggingFace: { passed: false, error: null },
    openai: { passed: false, error: null },
    anthropic: { passed: false, error: null, skipped: false },
  };

  // Test Gemini
  console.log('1️⃣  Probando Gemini 2.5 Flash...');
  try {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey && !geminiKey.includes('your_')) {
      const gemini = new GoogleService(geminiKey);
      const response = await gemini.analyzeMarket(TEST_QUESTION, TEST_CONTEXT);
      console.log(`   ✅ Gemini respondió: ${response.answer} (confidence: ${response.confidence}%)`);
      console.log(`   📝 Reasoning: ${response.reasoning.substring(0, 100)}...`);
      results.gemini.passed = true;
    } else {
      console.log('   ⚠️  Gemini API key no configurada');
      results.gemini.skipped = true;
    }
  } catch (error) {
    console.log(`   ❌ Gemini falló: ${error.message}`);
    results.gemini.error = error.message;
  }

  // Test Groq
  console.log('\n2️⃣  Probando Groq (Llama 3.1)...');
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && !groqKey.includes('your_')) {
      const groq = new GroqService(groqKey);
      const response = await groq.analyzeMarket(TEST_QUESTION, TEST_CONTEXT);
      console.log(`   ✅ Groq respondió: ${response.answer} (confidence: ${response.confidence}%)`);
      console.log(`   📝 Reasoning: ${response.reasoning.substring(0, 100)}...`);
      results.groq.passed = true;
    } else {
      console.log('   ⚠️  Groq API key no configurada');
      results.groq.skipped = true;
    }
  } catch (error) {
    console.log(`   ❌ Groq falló: ${error.message}`);
    results.groq.error = error.message;
  }

  // Test Hugging Face
  console.log('\n3️⃣  Probando Hugging Face...');
  try {
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    if (hfKey && !hfKey.includes('your_')) {
      const hf = new HuggingFaceService(hfKey);
      const response = await hf.analyzeMarket(TEST_QUESTION, TEST_CONTEXT);
      console.log(`   ✅ Hugging Face respondió: ${response.answer} (confidence: ${response.confidence}%)`);
      console.log(`   📝 Reasoning: ${response.reasoning.substring(0, 100)}...`);
      results.huggingFace.passed = true;
    } else {
      console.log('   ⚠️  Hugging Face API key no configurada');
      results.huggingFace.skipped = true;
    }
  } catch (error) {
    console.log(`   ❌ Hugging Face falló: ${error.message}`);
    results.huggingFace.error = error.message;
  }

  // Test OpenAI
  console.log('\n4️⃣  Probando OpenAI GPT-3.5 Turbo...');
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !openaiKey.includes('your_')) {
      const openai = new OpenAIService(openaiKey);
      const response = await openai.analyzeMarket(TEST_QUESTION, TEST_CONTEXT);
      console.log(`   ✅ OpenAI respondió: ${response.answer} (confidence: ${response.confidence}%)`);
      console.log(`   📝 Reasoning: ${response.reasoning.substring(0, 100)}...`);
      results.openai.passed = true;
    } else {
      console.log('   ⚠️  OpenAI API key no configurada');
      results.openai.skipped = true;
    }
  } catch (error) {
    console.log(`   ❌ OpenAI falló: ${error.message}`);
    results.openai.error = error.message;
  }

  // Test Anthropic
  console.log('\n5️⃣  Probando Anthropic Claude...');
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && !anthropicKey.includes('your_') && !anthropicKey.includes('sk-ant-your')) {
      const anthropic = new AnthropicService(anthropicKey);
      const response = await anthropic.analyzeMarket(TEST_QUESTION, TEST_CONTEXT);
      console.log(`   ✅ Anthropic respondió: ${response.answer} (confidence: ${response.confidence}%)`);
      console.log(`   📝 Reasoning: ${response.reasoning.substring(0, 100)}...`);
      results.anthropic.passed = true;
    } else {
      console.log('   ⚠️  Anthropic API key no configurada (opcional)');
      results.anthropic.skipped = true;
    }
  } catch (error) {
    console.log(`   ❌ Anthropic falló: ${error.message}`);
    results.anthropic.error = error.message;
  }

  return results;
}

async function testConsensus() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 2: Probando sistema de consenso completo');
  console.log('='.repeat(60) + '\n');

  try {
    const consensusService = new ConsensusService(
      process.env.OPENAI_API_KEY || '',
      process.env.ANTHROPIC_API_KEY || '',
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
      process.env.GROQ_API_KEY,
      process.env.HUGGINGFACE_API_KEY
    );

    console.log(`📊 Pregunta: "${TEST_QUESTION}"`);
    console.log(`📝 Contexto: "${TEST_CONTEXT}"\n`);

    console.log('🔄 Consultando IAs en orden de prioridad...\n');

    const result = await consensusService.getConsensus(
      TEST_QUESTION,
      TEST_CONTEXT,
      0.8 // 80% agreement required
    );

    console.log('\n✅ Consenso obtenido exitosamente!\n');
    console.log('📊 RESULTADOS:');
    console.log('   Outcome:', result.outcome === 1 ? 'YES ✅' : result.outcome === 2 ? 'NO ❌' : 'INVALID ⚠️');
    console.log('   Confidence:', `${result.confidence}%`);
    console.log('   Consensus Count:', `${result.consensusCount}/${result.totalModels}`);
    console.log('\n   📈 Votos:');
    console.log('      YES:', result.votes.yes);
    console.log('      NO:', result.votes.no);
    console.log('      INVALID:', result.votes.invalid);

    // Validar resultado
    if (result.totalModels === 0) {
      throw new Error('No se obtuvo ninguna respuesta de las IAs');
    }

    if (result.confidence < 50) {
      console.warn('\n⚠️  ADVERTENCIA: Confianza baja (<50%)');
    }

    return {
      passed: true,
      result: result,
    };
  } catch (error) {
    console.error('\n❌ Error en consenso:', error.message);
    return {
      passed: false,
      error: error.message,
    };
  }
}

async function testPriorityOrder() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 3: Verificando orden de prioridades');
  console.log('='.repeat(60) + '\n');

  const priorityOrder = [
    { name: 'Gemini', key: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY },
    { name: 'Groq', key: process.env.GROQ_API_KEY },
    { name: 'Hugging Face', key: process.env.HUGGINGFACE_API_KEY },
    { name: 'OpenAI', key: process.env.OPENAI_API_KEY },
    { name: 'Anthropic', key: process.env.ANTHROPIC_API_KEY },
  ];

  console.log('📋 Orden de prioridad esperado:');
  priorityOrder.forEach((ai, index) => {
    const hasKey = ai.key && !ai.key.includes('your_') && !ai.key.includes('sk-ant-your');
    const status = hasKey ? '✅' : '⏳';
    console.log(`   ${index + 1}. ${status} ${ai.name}`);
  });

  const availableAIs = priorityOrder.filter(ai => 
    ai.key && !ai.key.includes('your_') && !ai.key.includes('sk-ant-your')
  );

  console.log(`\n✅ ${availableAIs.length} IAs disponibles para consenso\n`);

  return {
    passed: availableAIs.length >= 3, // Mínimo 3 IAs necesarias
    availableCount: availableAIs.length,
  };
}

async function main() {
  console.log('\n🚀 INICIANDO TESTS COMPLETOS DEL SISTEMA DE CONSENSO\n');

  // Compilar TypeScript primero
  console.log('📦 Compilando TypeScript...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Compilación exitosa\n');
  } catch (error) {
    console.error('❌ Error en compilación:', error.message);
    process.exit(1);
  }

  const testResults = {
    individualAIs: null,
    consensus: null,
    priorityOrder: null,
  };

  // Test 1: IAs individuales
  testResults.individualAIs = await testIndividualAIs();

  // Test 2: Consenso
  testResults.consensus = await testConsensus();

  // Test 3: Orden de prioridades
  testResults.priorityOrder = await testPriorityOrder();

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL DE TESTS');
  console.log('='.repeat(60) + '\n');

  const individualPassed = Object.values(testResults.individualAIs).filter(r => r.passed).length;
  const individualTotal = Object.keys(testResults.individualAIs).length;
  const individualSkipped = Object.values(testResults.individualAIs).filter(r => r.skipped).length;

  console.log('1️⃣  IAs Individuales:');
  console.log(`   ✅ Pasadas: ${individualPassed}/${individualTotal - individualSkipped}`);
  console.log(`   ⏳ Omitidas: ${individualSkipped}`);
  console.log(`   ❌ Fallidas: ${individualTotal - individualPassed - individualSkipped}\n`);

  console.log('2️⃣  Sistema de Consenso:');
  console.log(`   ${testResults.consensus.passed ? '✅' : '❌'} ${testResults.consensus.passed ? 'PASÓ' : 'FALLÓ'}`);
  if (!testResults.consensus.passed) {
    console.log(`   Error: ${testResults.consensus.error}\n`);
  } else {
    console.log(`   Confidence: ${testResults.consensus.result.confidence}%`);
    console.log(`   Total Models: ${testResults.consensus.result.totalModels}\n`);
  }

  console.log('3️⃣  Orden de Prioridades:');
  console.log(`   ${testResults.priorityOrder.passed ? '✅' : '❌'} ${testResults.priorityOrder.passed ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`   IAs disponibles: ${testResults.priorityOrder.availableCount}\n`);

  // Determinar si todos los tests pasaron
  const allPassed = 
    testResults.consensus.passed &&
    testResults.priorityOrder.passed &&
    individualPassed >= 3; // Mínimo 3 IAs funcionando

  if (allPassed) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON!\n');
    process.exit(0);
  } else {
    console.log('⚠️  ALGUNOS TESTS FALLARON\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

