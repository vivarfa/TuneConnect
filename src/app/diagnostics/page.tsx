'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Server, 
  Settings,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'error';
  checks: {
    timestamp: string;
    environment: string;
    isProduction: boolean;
    kvAvailable: boolean;
    kvVariables: {
      KV_REST_API_URL: boolean;
      KV_REST_API_TOKEN: boolean;
      KV_URL: boolean;
    };
    errors: string[];
  };
  recommendations: string[];
}

export default function DiagnosticsPage() {
  const [healthData, setHealthData] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchHealthData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateDiagnosticReport = () => {
    if (!healthData) return '';
    
    return `TuneConnect - Reporte de Diagnóstico
` +
           `==========================================
` +
           `Fecha: ${new Date(healthData.checks.timestamp).toLocaleString('es-ES')}
` +
           `Estado: ${healthData.status}
` +
           `Entorno: ${healthData.checks.environment}
` +
           `Producción: ${healthData.checks.isProduction ? 'Sí' : 'No'}
` +
           `KV Disponible: ${healthData.checks.kvAvailable ? 'Sí' : 'No'}
` +
           `\nVariables de Entorno KV:
` +
           `- KV_REST_API_URL: ${healthData.checks.kvVariables.KV_REST_API_URL ? 'Configurada' : 'Faltante'}
` +
           `- KV_REST_API_TOKEN: ${healthData.checks.kvVariables.KV_REST_API_TOKEN ? 'Configurada' : 'Faltante'}
` +
           `- KV_URL: ${healthData.checks.kvVariables.KV_URL ? 'Configurada' : 'Faltante'}
` +
           `\nErrores: ${healthData.checks.errors.length > 0 ? healthData.checks.errors.join(', ') : 'Ninguno'}
` +
           `\nRecomendaciones:
${healthData.recommendations.map(r => `- ${r}`).join('\n')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Diagnósticos del Sistema</h1>
          <p className="text-xl text-gray-600">Verifica el estado de TuneConnect y la configuración de Vercel KV</p>
        </div>

        {/* Estado General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-6 h-6" />
              Estado General del Sistema
            </CardTitle>
            <CardDescription>
              Última verificación: {healthData ? new Date(healthData.checks.timestamp).toLocaleString('es-ES') : 'Cargando...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                ) : healthData ? (
                  getStatusIcon(healthData.status)
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-lg font-semibold">
                  {loading ? 'Verificando...' : healthData ? healthData.status.toUpperCase() : 'ERROR'}
                </span>
                {healthData && (
                  <Badge className={getStatusColor(healthData.status)}>
                    {healthData.status === 'healthy' ? 'Saludable' : 
                     healthData.status === 'degraded' ? 'Degradado' : 'Error'}
                  </Badge>
                )}
              </div>
              <Button onClick={fetchHealthData} disabled={loading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>

            {error && (
              <Alert className="mb-4">
                <XCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Detalles del Sistema */}
        {healthData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Estado de Vercel KV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Disponibilidad</h4>
                    <div className="flex items-center gap-2">
                      {healthData.checks.kvAvailable ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{healthData.checks.kvAvailable ? 'Disponible' : 'No disponible'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Entorno</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={healthData.checks.isProduction ? 'default' : 'secondary'}>
                        {healthData.checks.isProduction ? 'Producción' : 'Desarrollo'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold">Variables de Entorno KV</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Object.entries(healthData.checks.kvVariables).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-mono">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {healthData.checks.errors.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-600">Errores Detectados</h4>
                      <ul className="space-y-1">
                        {healthData.checks.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {healthData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>

                {healthData.status !== 'healthy' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Enlaces Útiles</h4>
                    <div className="space-y-2">
                      <a 
                        href="https://vercel.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Dashboard de Vercel
                      </a>
                      <a 
                        href="https://vercel.com/docs/storage/vercel-kv" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Documentación de Vercel KV
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reporte de Diagnóstico */}
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Diagnóstico</CardTitle>
                <CardDescription>
                  Copia este reporte para compartir con soporte técnico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {generateDiagnosticReport()}
                    </pre>
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(generateDiagnosticReport())}
                    className="w-full"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copiado' : 'Copiar Reporte'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}