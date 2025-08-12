'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface QrData {
  originalContent: string;
  contentType: 'text' | 'url' | 'image';
  createdAt: string;
  expiresAt: string;
}

export default function QrCodePage() {
  const params = useParams();
  const code = params.code as string;
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      fetchQrData();
    }
  }, [code]);

  const fetchQrData = async () => {
    try {
      const response = await fetch(`/api/qr-data?code=${code}`);
      const data = await response.json();
      
      if (data.success) {
        setQrData(data.qrData);
      } else {
        setError(data.error || 'Código QR no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado al portapapeles');
    } catch (err) {
      toast.error('Error al copiar');
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagen-qr-${code}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Imagen descargada');
    } catch (err) {
      toast.error('Error al descargar la imagen');
    }
  };

  const shareContent = async () => {
    if (navigator.share && qrData) {
      try {
        await navigator.share({
          title: 'Contenido QR',
          text: qrData.contentType === 'text' ? qrData.originalContent : 'Contenido compartido desde QR',
          url: qrData.contentType === 'url' ? qrData.originalContent : window.location.href
        });
      } catch (err) {
        // Fallback to copy
        copyToClipboard(qrData.originalContent);
      }
    } else if (qrData) {
      copyToClipboard(qrData.originalContent);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">Código no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">El código QR no existe o ha expirado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(qrData.expiresAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">
              {qrData.contentType === 'text' && 'Texto'}
              {qrData.contentType === 'url' && 'URL'}
              {qrData.contentType === 'image' && 'Imagen'}
            </CardTitle>
            {isExpired && (
              <div className="text-center text-red-600 text-sm">
                Este contenido ha expirado
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contenido */}
            <div className="space-y-4">
              {qrData.contentType === 'text' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{qrData.originalContent}</p>
                </div>
              )}
              
              {qrData.contentType === 'url' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 break-all">{qrData.originalContent}</p>
                </div>
              )}
              
              {qrData.contentType === 'image' && (
                <div className="flex justify-center">
                  <div className="relative max-w-md">
                    <Image
                      src={qrData.originalContent}
                      alt="Imagen del QR"
                      width={400}
                      height={400}
                      className="rounded-lg object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            {!isExpired && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => copyToClipboard(qrData.originalContent)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                
                {qrData.contentType === 'url' && (
                  <Button
                    onClick={() => openUrl(qrData.originalContent)}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>
                )}
                
                {qrData.contentType === 'image' && (
                  <Button
                    onClick={() => downloadImage(qrData.originalContent)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                )}
                
                <Button
                  onClick={shareContent}
                  variant="outline"
                  size="sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>
            )}

            {/* Información de expiración */}
            <div className="text-center text-sm text-gray-500">
              <p>Creado: {new Date(qrData.createdAt).toLocaleDateString('es-ES')}</p>
              <p>Expira: {new Date(qrData.expiresAt).toLocaleDateString('es-ES')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}