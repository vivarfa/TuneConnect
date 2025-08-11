'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Users, Shield, Smartphone, QrCode, Music, Star, ArrowRight, Sun, Moon, Sparkles, TrendingUp, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);



  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const stats = [
    {
      icon: TrendingUp,
      number: "500+",
      label: "DJs Activos",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Award,
      number: "10K+",
      label: "Solicitudes Procesadas",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Globe,
      number: "25+",
      label: "Países",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Sparkles,
      number: "99.9%",
      label: "Uptime",
      color: "from-yellow-400 to-orange-500"
    }
  ];

  const floatingElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 15 + (i * 12) % 70,
    y: 15 + (i * 18) % 70,
    delay: i * 0.2,
    duration: 2 + (i % 2)
  }));

  const features = [
    {
      icon: QrCode,
      title: "Generador QR Profesional",
      description: "Crea códigos QR únicos para texto, URLs, imágenes y más. Personaliza colores, logos, tamaños y niveles de corrección. Descarga en PNG, SVG, PDF y JPEG. Perfecto para promocionar tu música, redes sociales o eventos.",
      color: "from-purple-500 to-blue-500",
      benefits: ["Personalización completa", "Múltiples formatos", "Alta resolución", "Uso comercial"],
    },
    {
      icon: Music,
      title: "Sistema de Solicitudes Inteligente",
      description: "Recibe solicitudes musicales organizadas directamente en WhatsApp. Cada solicitud incluye el nombre de la canción, artista, dedicatoria y comprobante de pago automático. Nunca más pierdas una solicitud.",
      color: "from-green-400 to-cyan-400",
      benefits: ["WhatsApp directo", "Comprobantes incluidos", "Organización automática", "Historial completo"],
    },
    {
      icon: Smartphone,
      title: "Pagos Digitales Integrados",
      description: "Acepta propinas y pagos por solicitudes a través de PayPal, Yape y otros métodos. Los clientes pagan antes de enviar su solicitud, garantizando que recibas tu dinero. Sistema 100% seguro y automático.",
      color: "from-green-500 to-emerald-500",
      benefits: ["PayPal & Yape", "Pagos instantáneos", "Comprobanates automáticos", "Sin intermediarios"],
    },
    {
      icon: Users,
      title: "Branding Personalizado",
      description: "Customiza completamente tu perfil: colores, logos, fotos, mensajes de bienvenida y más. Crea una experiencia única que refleje tu estilo y marca personal como DJ profesional.",
      color: "from-purple-400 to-pink-400",
      benefits: ["Colores personalizados", "Logo propio", "Mensajes únicos", "Estilo profesional"],
    },
    {
      icon: Zap,
      title: "Experiencia Móvil Perfecta",
      description: "Diseño 100% responsivo que funciona perfectamente en todos los dispositivos. Tus clientes pueden solicitar canciones desde cualquier móvil, tablet o computadora sin problemas.",
      color: "from-orange-400 to-red-400",
      benefits: ["Todos los dispositivos", "Carga ultra rápida", "Interfaz intuitiva", "Sin apps necesarias"],
    },
    {
      icon: Shield,
      title: "Privacidad y Seguridad Total",
      description: "Tus datos se almacenan localmente en tu navegador, no en servidores externos. Control total sobre tu información, máxima privacidad y seguridad garantizada para ti y tus clientes.",
      color: "from-red-400 to-pink-400",
      benefits: ["Datos locales", "Sin servidores externos", "Máxima privacidad", "Control total"],
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Configura tu Perfil",
      description: "Sube tu foto, logo, y personaliza colores y mensajes",
      icon: Users
    },
    {
      number: "2",
      title: "Genera Códigos QR",
      description: "Crea QR personalizados para solicitudes y contenido",
      icon: QrCode
    },
    {
      number: "3",
      title: "Configura Pagos",
      description: "Conecta tu Yape y PayPal para recibir propinas",
      icon: Smartphone
    },
    {
      number: "4",
      title: "Recibe Solicitudes",
      description: "Las solicitudes llegan a tu WhatsApp con comprobante",
      icon: Music
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 overflow-hidden relative ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      {/* Floating Elements */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute w-2 h-2 rounded-full ${
            isDarkMode ? 'bg-purple-400/30' : 'bg-purple-500/20'
          }`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [-8, 8, -8],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}



      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-black/10 hover:bg-black/20 text-gray-900'
        } backdrop-blur-md border border-white/20`}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div
              key="sun"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated Background Elements */}
        <motion.div 
          style={{ y: y1 }}
          className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
            isDarkMode ? 'bg-purple-500/20' : 'bg-purple-400/30'
          }`}
        />
        <motion.div 
          style={{ y: y2 }}
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-blue-500/20' : 'bg-blue-400/30'
          }`}
        />
        <motion.div 
          style={{ y: y3 }}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-pink-500/10' : 'bg-pink-400/20'
          }`}
        />
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              TuneConnect
            </motion.h1>
            <motion.div 
              className="flex items-center justify-center gap-2 mt-4"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-6 h-6 text-purple-400" />
              </motion.div>
              <span className={`text-lg font-medium ${
                isDarkMode ? 'text-purple-300' : 'text-purple-600'
              }`}>Plataforma Profesional para DJs</span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-6 h-6 text-purple-400" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <motion.span
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0
                }}
                className="inline-block"
              >
                Conecta
              </motion.span>
              {' '}
              <motion.span
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="inline-block"
              >
                con
              </motion.span>
              {' '}
              <motion.span
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
                className="inline-block"
              >
                tu
              </motion.span>
              {' '}
              <motion.span
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6
                }}
                className="inline-block"
              >
                Audiencia
              </motion.span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                de Forma Inteligente
              </span>
            </h2>
            <motion.p 
              className={`text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              La plataforma completa para DJs profesionales: recibe solicitudes musicales con propinas integradas, 
              genera códigos QR personalizados y gestiona tu marca. Todo en una sola herramienta.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
          >
            <Link href="/dashboard?reset=true">
              <motion.div
                whileHover={{ 
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  y: [0, -2, 0],
                }}
                transition={{
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div
                    className="relative z-10 flex items-center"
                    animate={{
                      x: [0, 2, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-3"
                    >
                      <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-6 h-6 object-contain"
                      />
                    </motion.div>
                    Comenzar Gratis
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
            
            <Link href="/qr-converter">
              <motion.div
                whileHover={{ 
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  y: [0, -2, 0],
                }}
                transition={{
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.5
                  }
                }}
              >
                <Button size="lg" variant="outline" className={`px-12 py-6 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 relative overflow-hidden group ${
                  isDarkMode 
                    ? 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white' 
                    : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}>
                  <motion.div
                    className="relative z-10 flex items-center"
                    animate={{
                      x: [0, 2, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                      className="mr-3"
                    >
                      <QrCode className="w-6 h-6" />
                    </motion.div>
                    Convertidor QR
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    animate={{
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.2
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div 
                    className={`text-3xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-purple-300"
          >
            <span className="text-sm mb-2">Descubre más</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Características Principales
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Todo lo que necesitas para profesionalizar la interacción con tu audiencia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className={`transition-all duration-300 h-full backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50' 
                      : 'bg-white/80 border-gray-200 hover:border-purple-400/50 shadow-lg hover:shadow-xl'
                  }`}>
                    <CardContent className="p-6">
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                        animate={{
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: index * 0.2
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className={`text-xl font-bold mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{feature.title}</h3>
                      <p className={`leading-relaxed mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{feature.description}</p>
                      
                      {/* Benefits List */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <motion.div
                              key={benefitIndex}
                              className={`flex items-center text-xs ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: benefitIndex * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <motion.span 
                                className="mr-2"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: benefitIndex * 0.2 }}
                              >
                                ✓
                              </motion.span>
                              {benefit}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Demo Link */}
                      <motion.div 
                        className={`mt-4 flex items-center transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'text-purple-400 group-hover:text-purple-300' 
                            : 'text-purple-600 group-hover:text-purple-500'
                        }`}
                        whileHover={{ x: 5, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm font-medium">{feature.demo}</span>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className={`absolute inset-0 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20' 
              : 'bg-gradient-to-br from-purple-100/50 via-blue-100/50 to-pink-100/50'
          }`}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Usa Ahora las Herramientas Gratis</h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Accede completamente gratis a todas las herramientas de TuneConnect y transforma tu negocio como DJ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* QR Generator Demo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className={`transition-all duration-500 h-full backdrop-blur-sm border-2 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-purple-500/30 hover:border-purple-400/60' 
                  : 'bg-white/80 border-purple-300/50 hover:border-purple-500/60 shadow-xl hover:shadow-2xl'
              }`}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-4"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <QrCode className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Generador QR Profesional</h3>
                      <p className={`${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>Crea códigos QR únicos al instante</p>
                    </div>
                  </div>
                  
                  {/* Demo Preview */}
                  <div className={`p-6 rounded-xl mb-6 ${
                    isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100/80'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Vista previa en tiempo real:</span>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className={`w-4 h-4 border-2 border-t-transparent rounded-full ${
                          isDarkMode ? 'border-purple-400' : 'border-purple-600'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <motion.div 
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-mono ${
                          isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                        animate={{
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        QR
                      </motion.div>
                      <motion.div 
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-mono ${
                          isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                        animate={{
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                      >
                        QR
                      </motion.div>
                      <motion.div 
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-mono ${
                          isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                        animate={{
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.6
                        }}
                      >
                        QR
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Formatos disponibles:</span>
                      <div className="flex gap-2">
                        {['PNG', 'SVG', 'PDF', 'JPEG'].map((format, index) => (
                          <motion.span
                            key={format}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                            }`}
                            animate={{
                              y: [0, -2, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: index * 0.2
                            }}
                          >
                            {format}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/qr-converter">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3">
                        <motion.div
                          className="flex items-center justify-center"
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <QrCode className="w-5 h-5 mr-2" />
                           Generador QR
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* DJ Dashboard Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className={`transition-all duration-500 h-full backdrop-blur-sm border-2 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-green-500/30 hover:border-green-400/60' 
                  : 'bg-white/80 border-green-300/50 hover:border-green-500/60 shadow-xl hover:shadow-2xl'
              }`}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-4"
                      animate={{
                        rotate: [0, -5, 5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Music className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Dashboard DJ Profesional</h3>
                      <p className={`${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>Gestiona solicitudes y pagos</p>
                    </div>
                  </div>
                  
                  {/* Demo Preview */}
                  <div className={`p-6 rounded-xl mb-6 ${
                    isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100/80'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>Solicitudes en tiempo real:</span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-green-500 rounded-full"
                        />
                      </div>
                      
                      {[1, 2, 3].map((item, index) => (
                        <motion.div
                          key={item}
                          className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-slate-600/50' : 'bg-white/80'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.5 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                                className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3"
                              >
                                <Music className="w-3 h-3 text-white" />
                              </motion.div>
                              <div>
                                <div className={`text-sm font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>Canción #{item}</div>
                                <div className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Con propina incluida</div>
                              </div>
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                              className="text-green-500 font-bold text-sm"
                            >
                              $5.00
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Métodos de pago:</span>
                      <div className="flex gap-2">
                        {['PayPal', 'Yape', 'Efectivo'].map((method, index) => (
                          <motion.span
                            key={method}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                            }`}
                            animate={{
                              y: [0, -2, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: index * 0.2
                            }}
                          >
                            {method}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/dashboard?reset=true">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3">
                        <motion.div
                          className="flex items-center justify-center"
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Music className="w-5 h-5 mr-2" />
                          Crear Dashboard DJ
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={`py-20 px-4 ${
        isDarkMode ? 'bg-slate-800/30' : 'bg-gray-100/50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>¿Cómo Funciona?</h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Configura tu perfil en minutos y comienza a recibir solicitudes profesionales
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent z-0" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                      {step.number}
                    </div>
                    <motion.div 
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className={`w-8 h-8 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                    </motion.div>
                    <h3 className={`text-xl font-bold mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{step.title}</h3>
                    <p className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Preguntas Frecuentes</h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Resolvemos las dudas más comunes sobre nuestras herramientas
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "¿Cómo funciona el generador de códigos QR?",
                answer: "Nuestro generador QR te permite crear códigos personalizados para cualquier contenido: URLs, texto, imágenes, contactos, WiFi y más. Puedes personalizar colores, agregar tu logo, ajustar el tamaño y descargar en múltiples formatos (PNG, SVG, PDF, JPEG). Es perfecto para promocionar tus redes sociales, playlists de Spotify o dirigir clientes a tu dashboard de solicitudes."
              },
              {
                question: "¿Cómo recibo las solicitudes musicales y propinas?",
                answer: "Las solicitudes llegan directamente a tu WhatsApp con toda la información organizada: nombre de la canción, artista, dedicatoria y comprobante de pago automático. Los clientes pagan antes de enviar la solicitud a través de PayPal, Yape u otros métodos que configures. Nunca más perderás una propina o solicitud."
              },
              {
                question: "¿Es seguro usar TuneConnect? ¿Dónde se guardan mis datos?",
                answer: "Absolutamente seguro. Todos tus datos se almacenan localmente en tu navegador, no en servidores externos. Esto significa que tienes control total sobre tu información y máxima privacidad. Nadie más puede acceder a tus configuraciones, solicitudes o datos personales."
              },
              {
                question: "¿Puedo personalizar completamente mi perfil?",
                answer: "¡Por supuesto! Puedes personalizar colores, subir tu logo, cambiar fotos, crear mensajes de bienvenida únicos y adaptar toda la interfaz a tu marca personal. Cada DJ puede crear una experiencia única que refleje su estilo profesional."
              },
              {
                question: "¿Funciona en todos los dispositivos?",
                answer: "Sí, TuneConnect tiene un diseño 100% responsivo que funciona perfectamente en móviles, tablets y computadoras. Tus clientes pueden solicitar canciones desde cualquier dispositivo sin necesidad de descargar apps adicionales."
              },
              {
                question: "¿Hay límites en el uso de las herramientas?",
                answer: "No hay límites. Puedes generar tantos códigos QR como necesites, recibir solicitudes ilimitadas y personalizar tu perfil las veces que quieras. La plataforma está diseñada para DJs profesionales que necesitan herramientas sin restricciones."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 hover:border-purple-400/50' 
                    : 'bg-white/50 border-gray-200 hover:border-purple-400/50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{faq.question}</h3>
                <p className={`leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>¿Por Qué Elegir TuneConnect?</h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>La única plataforma que combina generación QR profesional con gestión de solicitudes musicales</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <QrCode className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>QR Profesional Avanzado</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Genera códigos QR personalizados con tu logo, colores y múltiples formatos de descarga. Perfecto para promocionar tu música y eventos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Music className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Solicitudes Inteligentes</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Recibe solicitudes musicales organizadas en WhatsApp con comprobantes de pago automáticos. Nunca más pierdas una propina.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Smartphone className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Pagos Integrados</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Acepta propinas y pagos por solicitudes a través de PayPal, Yape y más. Sistema 100% seguro con comprobantes automáticos.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' 
          : 'bg-gradient-to-r from-purple-100/80 to-pink-100/80'
      }`}>
        {/* Animated Background Elements */}
        <motion.div 
          className={`absolute top-10 left-10 w-32 h-32 rounded-full blur-2xl ${
            isDarkMode ? 'bg-purple-500/20' : 'bg-purple-400/30'
          }`}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`absolute bottom-10 right-10 w-40 h-40 rounded-full blur-2xl ${
            isDarkMode ? 'bg-pink-500/20' : 'bg-pink-400/30'
          }`}
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ¿Listo para Probarlo?
            </motion.h2>
            <motion.p 
              className={`text-xl mb-8 max-w-2xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Crea tu perfil de DJ en menos de 5 minutos y comienza a recibir solicitudes de inmediato
            </motion.p>
            <div className="flex justify-center">
              <Link href="/dashboard?reset=true">
                <motion.div
                  whileHover={{ 
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    y: {
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <motion.div
                      className="relative z-10 flex items-center"
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="mr-3"
                      >
                        <img
                          src="/logo.png"
                          alt="Logo"
                          className="w-6 h-6 object-contain"
                        />
                      </motion.div>
                      Comenzar Gratis Ahora
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 px-4 border-t transition-all duration-500 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-800' 
          : 'bg-gray-50/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="text-center mb-12">
            <motion.div
              className="flex items-center justify-center mb-6"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img
                src="/logo.png"
                alt="TuneConnect Logo"
                className="w-12 h-12 mr-4 rounded-full"
              />
              <h3 className={`text-4xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                TuneConnect
              </h3>
            </motion.div>
            
            <motion.p 
              className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              La plataforma líder para DJs profesionales. Conecta con tu audiencia y aumenta tus ingresos.
            </motion.p>
            
            {/* Feature Icons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              <motion.div 
                className={`group relative flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-purple-500/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50 hover:border-purple-400/50'
                } transition-all duration-500 shadow-lg hover:shadow-2xl`}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.div 
                  className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Music className="w-7 h-7 text-white" />
                </motion.div>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>Solicitudes</span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
              
              <motion.div 
                className={`group relative flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-green-500/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50 hover:border-green-400/50'
                } transition-all duration-500 shadow-lg hover:shadow-2xl`}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div 
                  className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-green-500/25"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <Smartphone className="w-7 h-7 text-white" />
                </motion.div>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>Propinas</span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
              
              <motion.div 
                className={`group relative flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-blue-500/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50 hover:border-blue-400/50'
                } transition-all duration-500 shadow-lg hover:shadow-2xl`}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div 
                  className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <QrCode className="w-7 h-7 text-white" />
                </motion.div>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>QR Codes</span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
              
              <motion.div 
                className={`group relative flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-orange-500/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50 hover:border-orange-400/50'
                } transition-all duration-500 shadow-lg hover:shadow-2xl`}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div 
                  className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                >
                  <Zap className="w-7 h-7 text-white" />
                </motion.div>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>Tiempo Real</span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
              
              <motion.div 
                className={`group relative flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-yellow-500/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50 hover:border-yellow-400/50'
                } transition-all duration-500 shadow-lg hover:shadow-2xl`}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div 
                  className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/25"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                >
                  <Shield className="w-7 h-7 text-white" />
                </motion.div>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>Seguro</span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
              
              <motion.div 
                className={`group relative flex flex-col items-center p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-pink-500/50' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50 hover:border-pink-400/50'
                } transition-all duration-500 shadow-lg hover:shadow-2xl`}
                whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div 
                  className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25"
                  animate={{ 
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2.5
                  }}
                >
                  <Users className="w-7 h-7 text-white" />
                </motion.div>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>Dashboard</span>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            </div>
          </div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h4 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ¿Listo para revolucionar tus eventos?
            </h4>
            <Link href="/dashboard?reset=true">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-bold rounded-full shadow-lg">
                  🚀 Comenzar Gratis - Sin Tarjeta de Crédito
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Bottom Bar */}
          <div className={`border-t pt-8 ${
            isDarkMode ? 'border-slate-800' : 'border-gray-200'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.div 
                className={`flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-4 md:mb-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span
                  whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer"
                >
                  🎵 Solicitudes de Música
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer"
                >
                  💰 Propinas Digitales
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer"
                >
                  📱 Generador QR
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer"
                >
                  🔒 100% Seguro
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer"
                >
                  ⚡ Tiempo Real
                </motion.span>
              </motion.div>
              
              <motion.div 
                className={`text-sm ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                © {new Date().getFullYear()} TuneConnect. Hecho con ❤️ para DJs profesionales.
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;