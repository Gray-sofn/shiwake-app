// app/api/health-check/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // CRONリクエストのセキュリティチェック（任意・推奨）
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Supabaseへの超軽量クエリ（SELECT 1）でDBを起こす/疎通確認
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      message: 'Supabase keep-alive successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Keep-alive failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'DB connection failed' },
      { status: 500 }
    );
  }
}