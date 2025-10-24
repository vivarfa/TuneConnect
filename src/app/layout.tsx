import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'TuneConnect',
  description: 'La plataforma definitiva para que los DJs se conecten con su audiencia a través de solicitudes de canciones.',
  icons: {
    icon: '/logo1.ico',
    shortcut: '/logo1.ico',
    apple: '/logo1.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1) Suprimir el error ResizeObserver que es común en aplicaciones responsive
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
                  e.stopImmediatePropagation();
                }
              });

              // 2) Mitigar hidratación: eliminar atributos externos inyectados por extensiones antes de que React hidrate
              (function () {
                try {
                  var htmlEl = document.documentElement;
                  if (htmlEl && htmlEl.hasAttribute('katalonextensionid')) {
                    htmlEl.removeAttribute('katalonextensionid');
                  }
                } catch (err) {
                  // No-op
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-4 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
               © {new Date().getFullYear()} <span className="font-semibold text-purple-400">TuneConnect</span>. Todos los derechos reservados.
             </p>
            <p className="text-sm mt-1">
               Desarrollado por <a href="https://www.billcodex.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Billcodex</a>
             </p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
