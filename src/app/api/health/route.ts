import { NextRequest, NextResponse } from 'next/server';
import { isKVAvailable } from '@/lib/database';
import { kv } from '@vercel/kv';

// GET - Verificar estado del sistema
export async function GET(request: NextRequest) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production' && !!process.env.VERCEL,
      kvAvailable: false,
      kvVariables: {
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        KV_URL: !!process.env.KV_URL
      },
      errors: [] as string[]
    };

    // Verificar disponibilidad de KV
    try {
      checks.kvAvailable = await isKVAvailable();
      if (checks.kvAvailable) {
        // Hacer una prueba adicional
        const testKey = `health-test-${Date.now()}`;
        await kv.set(testKey, { test: true, timestamp: new Date().toISOString() });
        const retrieved = await kv.get(testKey);
        await kv.del(testKey);
        
        if (!retrieved) {
          checks.errors.push('KV write/read test failed');
          checks.kvAvailable = false;
        }
      }
    } catch (error) {
      checks.errors.push(`KV test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      checks.kvAvailable = false;
    }

    // Verificar variables de entorno críticas
    if (checks.isProduction && !checks.kvVariables.KV_REST_API_URL) {
      checks.errors.push('Missing KV_REST_API_URL in production');
    }
    if (checks.isProduction && !checks.kvVariables.KV_REST_API_TOKEN) {
      checks.errors.push('Missing KV_REST_API_TOKEN in production');
    }

    const status = checks.errors.length === 0 ? 'healthy' : 'degraded';
    const httpStatus = checks.errors.length === 0 ? 200 : 503;

    return NextResponse.json({
      status,
      checks,
      recommendations: generateRecommendations(checks)
    }, { status: httpStatus });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function generateRecommendations(checks: any): string[] {
  const recommendations: string[] = [];

  if (checks.isProduction && !checks.kvAvailable) {
    recommendations.push('Configure Vercel KV database in your Vercel dashboard');
    recommendations.push('Go to Storage > Create Database > KV in your Vercel project');
    recommendations.push('Connect the database to your project');
    recommendations.push('Redeploy your application after KV setup');
  }

  if (!checks.kvVariables.KV_REST_API_URL && checks.isProduction) {
    recommendations.push('Ensure KV database is properly connected to your project');
  }

  if (checks.errors.length > 0) {
    recommendations.push('Check Vercel deployment logs for detailed error information');
  }

  if (recommendations.length === 0) {
    recommendations.push('System is healthy and ready to use');
  }

  return recommendations;
}