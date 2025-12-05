/**
 * Formatea el nombre del modelo para mostrar al usuario
 * Convierte nombres técnicos a nombres amigables
 */
export function formatModelName(modelName: string | undefined): string {
  if (!modelName) return 'Unknown';
  
  const lowerModel = modelName.toLowerCase();
  
  // Convertir gemini-2.5-flash o variaciones a "GEMINI IA"
  if (lowerModel.includes('gemini-2.5-flash') || 
      lowerModel.includes('gemini 2.5 flash') ||
      lowerModel === 'gemini-2.5-flash') {
    return 'GEMINI IA';
  }
  
  // Mantener otros nombres como están
  return modelName;
}

