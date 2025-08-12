'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, RefreshCw, Copy, Download, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { DJProfile } from '@/lib/types';

interface FormCreatorProps {
  djProfile: DJProfile;
  isDarkMode?: boolean;
}

interface FormResponse {
  success: boolean;
  id: string;
  shortUrl: string;
  qrCodeUrl: string;
  djSlug: string;
  expiresAt: string;
  storageMethod?: string;
}

export default function FormCreator({ djProfile, isDarkMode = false }: FormCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [expirationMonths, setExpirationMonths] = useState(6);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');

  const generateForm = async () => {
    if (!djProfile.djName || djProfile.djName.trim().length === 0) {
      setError('El nombre del DJ es requerido para generar el formulario');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          djProfile,
          expirationMonths
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generando formulario');
      }

      const data: FormResponse = await response.json();
      setFormData(data);
      
    } catch (error) {
      console.error('Error generando formulario:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!formData?.shortUrl) return;
    
    try {
      await navigator.clipboard.writeText(formData.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const downloadQrCode = () => {
    if (!formData?.qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = formData.qrCodeUrl;
    link.download = `qr-${djProfile.djName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const regenerateForm = () => {
    setFormData(null);
    generateForm();
  };

  return (
    <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className={`font-headline text-2xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <QrCode className="w-6 h-6" /> Generar Formulario QR
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Crea un formulario único para recibir solicitudes de música con código QR y link corto.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuración de expiración */}
        <div className="space-y-4">
          <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Período de expiración
          </Label>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={expirationMonths === 6 ? 'default' : 'outline'}
              onClick={() => setExpirationMonths(6)}
              className={`flex items-center gap-2 ${expirationMonths === 6 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <Clock className="w-4 h-4" /> 6 meses
            </Button>
            <Button
              variant={expirationMonths === 12 ? 'default' : 'outline'}
              onClick={() => setExpirationMonths(12)}
              className={`flex items-center gap-2 ${expirationMonths === 12 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <Calendar className="w-4 h-4" /> 12 meses
            </Button>
          </div>
          
          <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
            <p className="font-medium mb-1">⏰ Expiración automática</p>
            <p>
              El formulario se deshabilitará automáticamente después de {expirationMonths} meses para optimizar el almacenamiento.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Botón para generar */}
        <Button
          onClick={generateForm}
          disabled={isGenerating || !djProfile.djName}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          size="lg"
        >
          {isGenerating ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <QrCode className="w-5 h-5 mr-2" />
          )}
          {isGenerating ? 'Generando...' : 'Generar Formulario QR'}
        </Button>

        {/* Mensaje de error */}
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resultados */}
        {formData && (
          <div className="space-y-6">
            {/* URL corta */}
            <div className="space-y-3">
              <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Link del formulario
              </Label>
              <div className="flex gap-2">
                <Input
                  value={formData.shortUrl}
                  readOnly
                  className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`}
                />
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className={isDarkMode ? 'border-gray-600 text-black hover:bg-gray-700' : 'text-black'}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-500">¡Link copiado al portapapeles!</p>
              )}
            </div>

            {/* Código QR */}
            <div className="space-y-4">
              <Label className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Código QR
              </Label>
              
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* QR Display */}
                <div className={`flex-shrink-0 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="w-64 h-64 bg-white p-4 rounded-lg">
                    <img
                      src={formData.qrCodeUrl}
                      alt="Código QR del formulario"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* QR Info */}
                <div className="flex-1 space-y-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ¿Cómo usar tu formulario QR?
                    </h4>
                    <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <li>• Imprime el código QR y colócalo en tu cabina de DJ</li>
                      <li>• Comparte el link en tus redes sociales</li>
                      <li>• Los usuarios escanean y acceden al formulario</li>
                      <li>• Recibe solicitudes de música en tiempo real</li>
                      <li>• El formulario expira automáticamente en {expirationMonths} meses</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadQrCode}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" /> Descargar QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={regenerateForm}
                      disabled={isGenerating}
                      className={isDarkMode ? 'border-gray-600 text-black hover:bg-gray-700' : 'text-black'}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
              <h4 className="font-semibold mb-2">✨ Formulario generado exitosamente</h4>
              <p className="text-sm">
                ID: {formData.id} | Expira: {new Date(formData.expiresAt).toLocaleDateString('es-ES')}
              </p>
              {formData.storageMethod && (
                <p className="text-xs mt-1 opacity-75">
                  Almacenado en: {formData.storageMethod === 'vercel-kv' ? 'Vercel KV (Persistente)' : 'Memoria (Temporal)'}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}