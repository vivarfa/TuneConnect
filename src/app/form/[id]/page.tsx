'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Music, Send, User, CreditCard, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DJProfile } from '@/types/dj';

interface FormData {
  id: string;
  djProfile: DJProfile;
  djSlug: string;
  createdAt: string;
  expiresAt: string;
  expirationMonths: number;
  requests: any[];
}

interface MusicRequest {
  songName: string;
  artistName: string;
  genre: string;
  requesterName: string;
  selectedWallet: string;
  message?: string;
}

const musicGenres = [
  'Reggaeton', 'Salsa', 'Bachata', 'Merengue', 'Pop', 'Rock', 'Hip Hop',
  'Electronic', 'House', 'Techno', 'Cumbia', 'Vallenato', 'Rock en Español',
  'Pop Latino', 'Trap', 'R&B', 'Jazz', 'Blues', 'Country', 'Otro'
];

export default function DynamicFormPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [musicRequest, setMusicRequest] = useState<MusicRequest>({
    songName: '',
    artistName: '',
    genre: '',
    requesterName: '',
    selectedWallet: '',
    message: ''
  });

  // Cargar datos del formulario
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await fetch(`/api/forms?id=${formId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Formulario no encontrado');
        }
        
        const result = await response.json();
        setFormData(result.data);
        
      } catch (error) {
        console.error('Error cargando formulario:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      loadFormData();
    }
  }, [formId]);

  const handleInputChange = (field: keyof MusicRequest, value: string) => {
    setMusicRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;
    
    // Validaciones
    if (!musicRequest.songName.trim() || !musicRequest.artistName.trim() || 
        !musicRequest.requesterName.trim() || !musicRequest.genre || !musicRequest.selectedWallet) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formId,
          musicRequest
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error enviando solicitud');
      }

      setSubmitted(true);
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Formulario no disponible</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Este formulario puede haber expirado o no existir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formData) return null;

  const djProfile = formData.djProfile;
  const isDarkMode = djProfile.theme?.mode === 'dark';
  
  // Aplicar colores del tema del DJ
  const themeColors = {
    primary: djProfile.colors?.primary || '#7c3aed',
    background: djProfile.colors?.background || '#121212',
    accent: djProfile.colors?.accent || '#a78bfa',
    text: djProfile.colors?.text || '#ffffff'
  };

  if (submitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.background }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text }}>
              ¡Solicitud enviada!
            </h2>
            <p className="text-gray-600 mb-4">
              Tu solicitud de música ha sido enviada a {djProfile.djName}.
            </p>
            <p className="text-sm text-gray-500">
              El DJ revisará tu solicitud y la reproducirá cuando sea posible.
            </p>
            <Button 
              onClick={() => {
                setSubmitted(false);
                setMusicRequest({
                  songName: '',
                  artistName: '',
                  genre: '',
                  requesterName: '',
                  selectedWallet: '',
                  message: ''
                });
              }}
              className="mt-4"
              style={{ backgroundColor: themeColors.primary }}
            >
              Enviar otra solicitud
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ backgroundColor: themeColors.background }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header del DJ */}
        <Card className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={djProfile.profilePictureUrl} alt={djProfile.djName} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>
                  {djProfile.djName}
                </h1>
                <p className="text-gray-600">{djProfile.bio}</p>
              </div>
            </div>
            
            {djProfile.welcomeMessage && (
              <div 
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: `${themeColors.primary}20`, borderLeft: `4px solid ${themeColors.primary}` }}
              >
                <p style={{ color: themeColors.text }}>{djProfile.welcomeMessage}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Music className="w-3 h-3 mr-1" /> Solicitudes abiertas
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" /> 
                Expira: {new Date(formData.expiresAt).toLocaleDateString('es-ES')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de solicitud */}
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Music className="w-5 h-5" /> Solicitar Música
            </CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Completa el formulario para solicitar tu canción favorita
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información de la canción */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Nombre de la canción *</Label>
                  <Input
                    value={musicRequest.songName}
                    onChange={(e) => handleInputChange('songName', e.target.value)}
                    placeholder="Ej: Despacito"
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Artista *</Label>
                  <Input
                    value={musicRequest.artistName}
                    onChange={(e) => handleInputChange('artistName', e.target.value)}
                    placeholder="Ej: Luis Fonsi"
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Género *</Label>
                <Select value={musicRequest.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Selecciona un género" />
                  </SelectTrigger>
                  <SelectContent>
                    {musicGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Tu nombre *</Label>
                <Input
                  value={musicRequest.requesterName}
                  onChange={(e) => handleInputChange('requesterName', e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  required
                />
              </div>
              
              {/* Método de pago */}
              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Método de pago preferido *</Label>
                <Select value={musicRequest.selectedWallet} onValueChange={(value) => handleInputChange('selectedWallet', value)}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Selecciona método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {djProfile.payment?.paypalEnabled && (
                      <SelectItem value="paypal">PayPal</SelectItem>
                    )}
                    {djProfile.payment?.digitalWallets?.map((wallet, index) => (
                      <SelectItem key={index} value={wallet.name}>{wallet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Mensaje adicional (opcional)</Label>
                <Textarea
                  value={musicRequest.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Algún mensaje especial para el DJ..."
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  rows={3}
                />
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Separator />
              
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                style={{ backgroundColor: themeColors.primary }}
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Información de pago */}
        {djProfile.payment && (
          <Card className={`mt-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <CreditCard className="w-5 h-5" /> Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {djProfile.payment.paypalEnabled && djProfile.payment.paypalEmail && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">PayPal:</span>
                    <span className="text-blue-600">{djProfile.payment.paypalEmail}</span>
                  </div>
                )}
                
                {djProfile.payment.digitalWallets?.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{wallet.name}:</span>
                    <span className="text-gray-600">{wallet.account}</span>
                  </div>
                ))}
                
                {djProfile.payment.minTip && (
                  <p className="text-sm text-gray-500 text-center">
                    Propina mínima sugerida: ${djProfile.payment.minTip}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}