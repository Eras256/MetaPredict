#!/bin/bash
# ============================================
# Vercel Environment Variables Setup Script
# ============================================
# Este script ayuda a configurar variables de entorno en Vercel
# de forma segura sin exponer secretos
#
# Uso:
#   chmod +x scripts/setup-vercel-env.sh
#   ./scripts/setup-vercel-env.sh
# ============================================

set -e

echo "============================================"
echo "Vercel Environment Variables Setup"
echo "============================================"
echo ""

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado."
    echo "   Instala con: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI encontrado"
echo ""

# Verificar autenticación
if ! vercel whoami &> /dev/null; then
    echo "⚠️  No estás autenticado en Vercel."
    echo "   Ejecuta: vercel login"
    exit 1
fi

echo "✅ Autenticado en Vercel"
echo ""

# Leer variables desde env.example
ENV_FILE="env.example"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró env.example"
    exit 1
fi

echo "📄 Leyendo variables desde: $ENV_FILE"
echo ""

# Generar lista de variables
echo "============================================"
echo "Variables encontradas:"
echo "============================================"
echo ""

# Extraer variables (excluyendo comentarios y líneas vacías)
grep -E '^[A-Z_]+=' "$ENV_FILE" | grep -v '^#' | while IFS='=' read -r var_name var_value; do
    # Ocultar valores sensibles
    if [[ "$var_name" =~ (API_KEY|SECRET|PRIVATE_KEY|PASSWORD|DATABASE_URL) ]]; then
        echo "  $var_name = [OCULTO - Configurar en Vercel Dashboard]"
    elif [[ "$var_value" =~ (your_.*_here|change.*production|localhost) ]]; then
        echo "  $var_name = [CONFIGURAR]"
    else
        # Mostrar solo primeros 50 caracteres para valores largos
        display_value="${var_value:0:50}"
        if [ ${#var_value} -gt 50 ]; then
            display_value="${display_value}..."
        fi
        echo "  $var_name = $display_value"
    fi
done

echo ""
echo "============================================"
echo "Próximos Pasos:"
echo "============================================"
echo ""
echo "1. Ve al Dashboard de Vercel:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Selecciona tu proyecto → Settings → Environment Variables"
echo ""
echo "3. Agrega cada variable manualmente"
echo ""
echo "4. O usa el archivo generado: vercel-env-commands.txt"
echo ""
echo "💡 Para generar comandos de Vercel CLI, ejecuta:"
echo "   ./scripts/vercel-env-setup.ps1 (Windows)"
echo "   O revisa: VERCEL_ENV_VARIABLES.md"
echo ""

