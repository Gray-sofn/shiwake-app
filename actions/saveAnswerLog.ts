// actions/saveAnswerLog.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export type SaveAnswerInput = {
  questionId: string;
  isCorrect: boolean;
  // 複合仕訳にも対応できる柔軟なオブジェクト（不正解時のみ使用）
  userAnswer?: Record<string, unknown> | Array<unknown>;
  // AIから生成されたアドバイス文（生成済みの場合は渡す）
  aiAdvice?: string;
};

export async function saveAnswerLog({
  questionId,
  isCorrect,
  userAnswer,
  aiAdvice,
}: SaveAnswerInput) {
  try {
    // 1. Clerk から現在ログイン中のユーザーIDを取得
    const { userId } = await auth();

    if (!userId) {
      console.log('[DB] ゲストユーザーのため回答ログの保存をスキップしました');
      return { success: true, isGuest: true };
    }

    // 2. Prisma を使って AnswerLog テーブルへ保存
    // JSON型の null は Prisma.JsonNull (または Prisma.DbNull) を使用する
    const formattedUserAnswer =
      isCorrect || userAnswer == null
        ? Prisma.JsonNull
        : (userAnswer as Prisma.InputJsonValue);

    // 設計通り、正解時 (isCorrect === true) は userAnswer / aiAdvice を null に設定
    const log = await prisma.answerLog.create({
      data: {
        userId,
        questionId,
        isCorrect,
        userAnswer: formattedUserAnswer,
        aiAdvice: isCorrect ? null : (aiAdvice ?? null),
      },
    });

    console.log(`[DB] 回答ログを保存しました (ID: ${log.id}, 正否: ${isCorrect})`);

    return { success: true, logId: log.id };
  } catch (error) {
    console.error('❌ 回答ログ保存エラー:', error);
    return { success: false, error: '回答ログの保存に失敗しました。' };
  }
}