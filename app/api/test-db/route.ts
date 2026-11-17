// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. テスト用データの登録・更新（upsertで重複防止）
    const testRecord = await prisma.userProgress.upsert({
      where: {
        userId_questionId: {
          userId: 'test-user-001',
          questionId: 'q-test-01',
        },
      },
      update: {
        isWrong: true,
      },
      create: {
        userId: 'test-user-001',
        questionId: 'q-test-01',
        isWrong: true,
      },
    });

    // 2. 登録済みデータの件数と内容を取得
    const allRecords = await prisma.userProgress.findMany();

    return NextResponse.json({
      success: true,
      message: '🎉 Supabase / Prisma 7 接続テスト成功！',
      record: testRecord,
      totalCount: allRecords.length,
    });
  } catch (error: unknown) {
    console.error('DB Connection Error:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}