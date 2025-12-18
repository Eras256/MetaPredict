#!/bin/bash

# Script para monitorear logs de resolución de mercados
# Uso: ./monitor-resolution-logs.sh [vercel_project_name]

PROJECT_NAME=${1:-"metapredict"}
VERCEL_API_TOKEN=${VERCEL_API_TOKEN:-""}

if [ -z "$VERCEL_API_TOKEN" ]; then
    echo "⚠️  VERCEL_API_TOKEN no está configurado"
    echo "💡 Obtén tu token en: https://vercel.com/account/tokens"
    echo "💡 Exporta: export VERCEL_API_TOKEN=tu_token"
    exit 1
fi

echo "🔍 Monitoreando logs de resolución para proyecto: $PROJECT_NAME"
echo "=" | head -c 80 && echo ""

# Obtener deployments recientes
echo "📦 Obteniendo deployments recientes..."
DEPLOYMENTS=$(curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" \
    "https://api.vercel.com/v6/deployments?project=$PROJECT_NAME&limit=5" \
    | jq -r '.deployments[].uid' | head -1)

if [ -z "$DEPLOYMENTS" ]; then
    echo "❌ No se encontraron deployments"
    exit 1
fi

DEPLOYMENT_ID=$(echo $DEPLOYMENTS | head -1)
echo "✅ Deployment ID: $DEPLOYMENT_ID"
echo ""

# Obtener logs del cron job
echo "📊 Buscando logs del cron job..."
echo "=" | head -c 80 && echo ""

# Filtrar logs relacionados con resolución
curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" \
    "https://api.vercel.com/v2/deployments/$DEPLOYMENT_ID/events" \
    | jq -r '.events[] | select(.payload.text | contains("EventMonitor") or contains("Gelato") or contains("resolution")) | .payload.text' \
    | tail -50

echo ""
echo "=" | head -c 80 && echo ""
echo "✅ Monitoreo completado"
echo ""
echo "💡 Para ver logs en tiempo real, usa:"
echo "   vercel logs $PROJECT_NAME --follow"

