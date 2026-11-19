// app/mypage/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';

async function MyPageContent() {
  // 1. Clerk からログインユーザーの取得（未ログインならログイン画面へ）
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. ユーザーの全回答ログを降順（最新順）で取得
  const answerLogs = await prisma.answerLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // 3. 統計データの計算
  const totalCount = answerLogs.length;
  const correctCount = answerLogs.filter((log) => log.isCorrect).length;
  const accuracyRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // 4. 不正解だったログ（AIアドバイスあり）を抽出
  const wrongLogs = answerLogs.filter((log) => !log.isCorrect);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ページタイトル */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">マイページ（学習履歴）</h1>
          <p className="text-sm text-gray-500">これまでの演習実績とAIのアドバイスを確認できます</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          演習を始める
        </Link>
      </div>

      {/* 統計カード情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-500">総解答数</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{totalCount} <span className="text-base font-normal">問</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-500">正解数</p>
          <p className="text-3xl font-extrabold text-green-600 mt-2">{correctCount} <span className="text-base font-normal">問</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-500">通算正答率</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{accuracyRate} <span className="text-base font-normal">%</span></p>
        </div>
      </div>

      {/* AIアドバイス・復習履歴一覧 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>🤖 AIアドバイス・復習ノート</span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-normal">
            誤答 {wrongLogs.length} 件
          </span>
        </h2>

        {wrongLogs.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500">
            {totalCount === 0
              ? 'まだ演習履歴がありません。問題を解いてみましょう！'
              : '🎉 素晴らしい！誤答ログはありません。'}
          </div>
        ) : (
          <div className="space-y-4">
            {wrongLogs.map((log) => (
              <div key={log.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-400 border-b pb-2">
                  <span className="font-mono">問題ID: {log.questionId}</span>
                  <span>{new Date(log.createdAt).toLocaleString('ja-JP')}</span>
                </div>

                {/* AIからのアドバイス */}
                {log.aiAdvice && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-950 space-y-1">
                    <p className="font-bold text-blue-900 flex items-center gap-1">
                      <span>🤖 AIからの解説アドバイス</span>
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">{log.aiAdvice}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <div>
      {/* 共通ヘッダーなどがあればここに置くと即座に表示されます */}
      <Suspense fallback={<p className="p-4 text-gray-500">読み込み中...</p>}>
        <MyPageContent />
      </Suspense>
    </div>
  );
}