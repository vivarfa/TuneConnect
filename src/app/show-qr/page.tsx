// File: src/app/show-qr/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Un componente separado para poder usar useSearchParams
function ShowQrImage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

  if (!imageUrl) {
    return (
      <div style={styles.container}>
        <h1 style={styles.text}>Error: No se encontró la URL de la imagen.</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <img src={imageUrl} alt="Contenido del Código QR" style={styles.image} />
    </div>
  );
}

// La página principal usa Suspense para el renderizado del lado del cliente
export default function ShowQrPage() {
  return (
    <Suspense fallback={<div style={styles.container}><p style={styles.text}>Cargando...</p></div>}>
      <ShowQrImage />
    </Suspense>
  );
}

// Estilos básicos para que se vea bien
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#1a1a2e',
    flexDirection: 'column',
  },
  image: {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  text: {
    color: 'white',
    fontFamily: 'sans-serif',
  }
};