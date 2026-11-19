// actions/getWrongQuestionIds.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getWrongQuestionIdsFromDB(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  // 1. ログインユーザーの全回答ログを最新順で取得
  const logs = await prisma.answerLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      questionId: true,
      isCorrect: true,
    },
  });

  // 2. 各問題ごとの「最新の回答結果」だけを抽出
  const latestStatusMap = new Map<string, boolean>();

  for (const log of logs) {
    // まだ Map に登録されていない＝それがその問題の最新のログ
    if (!latestStatusMap.has(log.questionId)) {
      latestStatusMap.set(log.questionId, log.isCorrect);
    }
  }

  // 3. 最新の回答が「不正解(false)」である問題IDだけをフィルタリング
  const wrongQuestionIds = Array.from(latestStatusMap.entries())
    .filter(([_, isCorrect]) => !isCorrect)
    .map(([questionId]) => questionId);

  return wrongQuestionIds;
}