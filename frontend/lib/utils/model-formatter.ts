/**
 * Formats model name for user display
 * Converts technical names to friendly names
 */
export function formatModelName(modelName: string | undefined): string {
  if (!modelName) return 'Unknown';
  
  const lowerModel = modelName.toLowerCase();
  
  // Convert gemini-2.5-flash or variations to "GEMINI IA"
  if (lowerModel.includes('gemini-2.5-flash') || 
      lowerModel.includes('gemini 2.5 flash') ||
      lowerModel === 'gemini-2.5-flash') {
    return 'GEMINI IA';
  }
  
  // Keep other names as they are
  return modelName;
}

