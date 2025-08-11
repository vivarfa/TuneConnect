'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Phone, Upload, Music, Check, ExternalLink } from 'lucide-react';

interface DJProfile {
  id: string;
  name: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    borderRadius?: number;
  };
  colors?: {
    primary?: string;
    secondary?: string;
  };
  payment?: {
    minTip?: number;
    paypalEnabled?: boolean;
    paypalEmail?: string;
    paypalMeLink?: string;
    digitalWallets?: Array<{
      name: string;
      account: string;
      qrCodeUrl?: string;
    }>;
    wallets?: Array<{
      type: string;
      address: string;
      qrCode?: string;
    }>;
  };
  notifications?: {
    whatsappNumber?: string;
  };
  customization?: {
    backgroundColor: string;
    textColor: string;
    inputBackgroundColor: string;
    inputTextColor: string;
    inputBorderColor: string;
    transparency?: number;
  };
}

export function RequestForm({ djProfile, isPreview = false, customization: propCustomization }: { djProfile: DJProfile; isPreview?: boolean; customization?: any }) {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    songName: '',
    artistName: '',
    genre: '',
    requesterName: '',
    selectedWallet: '',
    paymentProof: null as File | null
  });

  const [customization, setCustomization] = useState({
    primaryColor: '#8B5CF6',
    secondaryColor: '#10B981',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#F9FAFB',
    inputBackgroundColor: 'rgba(255, 255, 255, 0.1)',
    inputTextColor: '#1f2937',
    inputBorderColor: 'rgba(255, 255, 255, 0.2)',
    buttonTextColor: '#FFFFFF',
    accentColor: '#F59E0B'
  });

  useEffect(() => {
    if (propCustomization) {
      setCustomization(prev => ({ ...prev, ...propCustomization }));
    }
  }, [propCustomization]);

  const getCurrencySymbol = (country: string) => {
    const currencyMap: { [key: string]: string } = {
      'Peru': 'S/',
      'Mexico': '$',
      'Colombia': '$',
      'Argentina': '$',
      'Chile': '$',
      'Ecuador': '$',
      'Bolivia': 'Bs',
      'Venezuela': 'Bs',
      'Uruguay': '$U',
      'Paraguay': '₲',
      'Brasil': 'R$',
      'España': '€',
      'Estados Unidos': '$'
    };
    return currencyMap[country] || '$';
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.songName.trim() !== '' && formData.artistName.trim() !== '';
      case 2:
        return formData.selectedWallet !== '';
      case 3:
        return formData.paymentProof !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleFormNext = () => {
    if (isStepValid(formStep) && formStep < 4) {
      setFormStep(formStep + 1);
    }
  };

  const handleFormPrevious = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, paymentProof: file });
    }
  };

  const sendToWhatsApp = () => {
    const receiptFileName = formData.paymentProof ? formData.paymentProof.name : 'No adjuntado';
    const displaySymbol = getCurrencySymbol('Peru');
    
    const message = `🎵 *Nueva Solicitud de Canción*\n\n` +
      `*Canción:* ${formData.songName}\n` +
      `*Artista:* ${formData.artistName}\n` +
      (formData.genre ? `*Género:* ${formData.genre}\n` : '') +
      (formData.requesterName ? `*Solicitado por:* ${formData.requesterName}\n` : '') +
      `*Método de pago:* ${formData.selectedWallet}\n` +
      `*Monto:* ${displaySymbol}${djProfile.payment?.minTip}\n` +
      `*Comprobante:* ${receiptFileName}\n\n` +
      `¡Gracias por tu solicitud! 🎶`;

    const cleanWhatsappNumber = djProfile.notifications?.whatsappNumber?.replace(/[^\d+]/g, '') || '';
    const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative">


      <div 
        className="w-full max-w-2xl mx-auto backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/10 transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden z-10"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 30%, #0f172a 70%, #000000 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
          {/* Enhanced Progress Steps */}
          <div className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-sm font-bold transition-all duration-500 transform ${
                    step < formStep
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white scale-110 shadow-lg'
                      : step === formStep
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-125 shadow-xl animate-pulse'
                      : 'bg-gray-600/50 text-gray-300 backdrop-blur-sm'
                  }`}
                  style={{
                    boxShadow: step === formStep ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none'
                  }}
                >
                  {step < formStep ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-4 sm:w-6 lg:w-8 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-all duration-500 rounded-full ${
                      step < formStep 
                        ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-sm' 
                        : 'bg-gray-600/30 backdrop-blur-sm'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Paso 1: Información de la Canción */}
          {formStep === 1 && (
            <div className="space-y-6 animate-fadeInRight">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg animate-bounce">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Información de la Canción
                </h2>
                <p className="text-white/70 text-lg">
                  ✨ Cuéntanos qué canción quieres escuchar ✨
                </p>
              </div>

              <div className="group">
                <Label className="text-white/90 font-semibold text-lg mb-3 block flex items-center">
                  🎵 Nombre de la Canción *
                </Label>
                <div className="relative">
                  <Input
                    value={formData.songName}
                    onChange={(e) => setFormData({...formData, songName: e.target.value})}
                    placeholder="Ej: Blinding Lights"
                    className="w-full p-4 text-lg bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 focus:scale-[1.01] shadow-lg"
                    style={{
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                   }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <Label className="text-white/90 font-semibold text-lg mb-3 block flex items-center">
                  🎤 Artista *
                </Label>
                <div className="relative">
                  <Input
                    value={formData.artistName}
                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                    placeholder="Ej: The Weeknd"
                    className="w-full p-4 text-lg bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 focus:scale-[1.01] shadow-lg"
                    style={{
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                   }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <Label className="text-white/90 font-semibold text-lg mb-3 block flex items-center">
                  🎸 Género (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    placeholder="Ej: Pop, Rock, Reggaeton"
                    className="w-full p-4 text-lg bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 focus:scale-[1.01] shadow-lg"
                    style={{
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                   }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <Label className="text-white/90 font-semibold text-lg mb-3 block flex items-center">
                  👤 Tu Nombre (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    value={formData.requesterName}
                    onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                    placeholder="Ej: María"
                    className="w-full p-4 text-lg bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 focus:scale-[1.01] shadow-lg"
                    style={{
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                   }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Método de pago */}
          {formStep === 2 && (
            <div className="space-y-6 animate-fadeInLeft">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  Método de Pago
                </h2>
                <p className="text-white/70 text-lg">
                  💰 Elige cómo quieres apoyar al DJ 💰
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Monto de Propina</h3>
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                  S/ {djProfile.payment?.minTip || 9}
                </div>
                <p className="text-sm sm:text-base text-white/60">
                  Envía exactamente esta cantidad
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* PayPal Option */}
                {djProfile.payment?.paypalEnabled && djProfile.payment?.paypalEmail && (
                  <div
                    className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${
                      formData.selectedWallet === 'PayPal'
                        ? 'border-blue-400 bg-blue-500/20 shadow-lg'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setFormData({...formData, selectedWallet: 'PayPal'});
                      const paypalLink = djProfile.payment?.paypalMeLink || `https://paypal.me/${djProfile.payment?.paypalEmail}`;
                      window.open(paypalLink, '_blank', 'noopener,noreferrer');
                    }}
                    title="Hacer clic para ir a PayPal"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.36 9.36 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106-.32 2.027a.641.641 0 0 0 .633.74h3.94c.524 0 .968-.382 1.05-.9l.043-.27.82-5.18.053-.288c.082-.518.526-.9 1.05-.9h.66c3.743 0 6.671-1.52 7.527-5.917.358-1.837.174-3.37-.777-4.471a3.642 3.642 0 0 0-1.295-.881z" fill="#253B80"/>
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.36 9.36 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106-.32 2.027a.641.641 0 0 0 .633.74h3.94c.524 0 .968-.382 1.05-.9l.043-.27.82-5.18.053-.288c.082-.518.526-.9 1.05-.9h.66c3.743 0 6.671-1.52 7.527-5.917.358-1.837.174-3.37-.777-4.471a3.642 3.642 0 0 0-1.295-.881z" fill="#179BD7"/>
                            <path d="M6.908 6.208c.08-.518.526-.9 1.05-.9h5.49c.65 0 1.26.044 1.81.132a6.5 6.5 0 0 1 1.526.473c.358-1.837.174-3.37-.777-4.471C14.897.543 12.889 0 10.318 0H2.858c-.524 0-.968.382-1.05.9L-.099 21.237a.641.641 0 0 0 .633.74h4.606l1.12-7.106.648-4.663z" fill="#253B80"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white text-sm sm:text-base">PayPal</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Oficial</span>
                          </div>
                          <p className="text-xs sm:text-sm text-white/60 truncate">{djProfile.payment?.paypalEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.selectedWallet === 'PayPal' && (
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                        )}
                        <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Wallets */}
                {djProfile.payment?.digitalWallets?.map((wallet, index) => (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      formData.selectedWallet === wallet.name
                        ? 'border-purple-400 bg-purple-500/20 shadow-lg'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setFormData({...formData, selectedWallet: wallet.name})}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-base">{wallet.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-white text-sm sm:text-base">{wallet.name}</h4>
                          <p className="text-xs sm:text-sm text-white/60 truncate">{wallet.account}</p>
                        </div>
                      </div>
                      {formData.selectedWallet === wallet.name && (
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    {wallet.qrCodeUrl && formData.selectedWallet === wallet.name && (
                      <div className="mt-4 sm:mt-6 text-center">
                        <img src={wallet.qrCodeUrl} alt="QR Code" className="mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-lg shadow-lg" />
                        <p className="text-xs sm:text-sm text-white/60 mt-3">Escanea para pagar rápidamente</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3: Comprobante de Pago */}
          {formStep === 3 && (
            <div className="space-y-6 animate-fadeInRight">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg animate-bounce">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Comprobante de Pago
                </h2>
                <p className="text-white/70 text-lg">
                  📸 Sube tu comprobante de pago 📸
                </p>
              </div>

              <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">Sube tu comprobante de pago</p>
                      <p className="text-white/60">Arrastra una imagen aquí o haz clic para seleccionar</p>
                    </div>
                  </div>
                </label>
                {formData.paymentProof && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                    <p className="text-green-400 font-semibold">✓ {formData.paymentProof.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {formStep === 4 && (
            <div className="space-y-6 animate-fadeInLeft">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  ¡Solicitud Lista!
                </h2>
                <p className="text-white/70 text-lg">
                  🎉 Tu solicitud está lista para enviar 🎉
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Resumen de tu solicitud:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Canción:</span>
                    <span className="text-white font-semibold">{formData.songName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Artista:</span>
                    <span className="text-white font-semibold">{formData.artistName}</span>
                  </div>
                  {formData.genre && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Género:</span>
                      <span className="text-white font-semibold">{formData.genre}</span>
                    </div>
                  )}
                  {formData.requesterName && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Solicitado por:</span>
                      <span className="text-white font-semibold">{formData.requesterName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/70">Método de pago:</span>
                    <span className="text-white font-semibold">{formData.selectedWallet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Monto:</span>
                    <span className="text-white font-semibold">S/{djProfile.payment?.minTip}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/20">
            {/* Logo centrado en móvil */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <img src="/logo.png" alt="TuneConnect" className="w-5 h-5 rounded" />
                <span className="text-white font-bold text-sm">TuneConnect</span>
              </div>
            </div>
            
            {/* Navegación */}
            <div className="flex justify-between items-center">
              {formStep > 1 ? (
                <Button
                  onClick={handleFormPrevious}
                  className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl backdrop-blur-md group text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span className="font-semibold">Anterior</span>
                </Button>
              ) : (
                <div></div>
              )}
              
              {/* Logo centrado en desktop */}
              <div className="hidden sm:flex flex-1 justify-center">
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <img src="/logo.png" alt="TuneConnect" className="w-6 h-6 rounded" />
                  <span className="text-white font-bold text-lg">TuneConnect</span>
                </div>
              </div>

              {formStep === 4 ? (
                <Button
                  onClick={sendToWhatsApp}
                  className="flex items-center px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl border border-white/20 group text-sm sm:text-base"
                >
                  <Phone className="w-4 h-4 mr-1 sm:mr-2 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold hidden sm:inline">Enviar por WhatsApp</span>
                  <span className="font-semibold sm:hidden">Enviar</span>
                </Button>
              ) : (
                <Button
                  onClick={handleFormNext}
                  disabled={!isStepValid(formStep)}
                  className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl border border-white/20 group text-sm sm:text-base"
                >
                  <span className="font-semibold">Siguiente</span>
                  <ArrowRight className="w-4 h-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
         @keyframes float {
           0%, 100% {
             transform: translateY(0px) rotate(0deg);
           }
           50% {
             transform: translateY(-20px) rotate(180deg);
           }
         }
         
         @keyframes float-delayed {
           0%, 100% {
             transform: translateY(0px) rotate(0deg);
           }
           50% {
             transform: translateY(-15px) rotate(-180deg);
           }
         }
         
         @keyframes pulse-slow {
           0%, 100% {
             opacity: 0.2;
             transform: scale(1);
           }
           50% {
             opacity: 0.3;
             transform: scale(1.05);
           }
         }
         
         .animate-float {
           animation: float 8s ease-in-out infinite;
         }
         
         .animate-float-delayed {
           animation: float-delayed 10s ease-in-out infinite;
         }
         
         .animate-pulse-slow {
           animation: pulse-slow 6s ease-in-out infinite;
         }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.5s ease-out;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.5s ease-out;
        }
      `}</style></div>
  );
}

export default RequestForm;