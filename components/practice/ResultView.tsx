'use client';

interface ResultViewProps {
  score: number;
  totalQuestions: number;
  wrongCount: number;
  onRetryWrong: () => void;
  onRetryAll: () => void;
  onGoHome: () => void;
}

export function ResultView({
  score,
  totalQuestions,
  wrongCount,
  onRetryWrong,
  onRetryAll,
  onGoHome,
}: ResultViewProps) {
  const accuracy = Math.round((score / totalQuestions) * 100);

  return (
    <main className="max-w-lg mx-auto p-6 font-sans text-center">
      <div className="bg-white border p-8 rounded-2xl shadow-sm space-y-6">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">演習終了！</h1>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="text-sm text-gray-600 mb-1">正答数</div>
          <div className="text-4xl font-extrabold text-blue-900 mb-2">
            {score} <span className="text-lg font-normal text-gray-600">/ {totalQuestions} 問</span>
          </div>
          <div className="text-sm font-bold text-blue-700">正答率 {accuracy}%</div>
        </div>

        <p className="text-sm text-gray-600">
          {accuracy === 100
            ? '素晴らしい！全問正解です！この調子でマスターしましょう！'
            : accuracy >= 80
              ? '惜しい！あと少しで満点です。解説を見直して復習しましょう。'
              : 'お疲れ様でした！間違えた問題の解説をよく読んで再挑戦してみましょう。'}
        </p>

        {/* ★ 間違えた問題がある場合のみ表示 */}
        <div className="space-y-3 pt-2">
          {wrongCount > 0 && (
            <button
              onClick={onRetryWrong}
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition"
            >
              間違えた問題（{wrongCount}問）を解き直す 🔄
            </button>
          )}

          <button
            // 同じ条件で再挑戦（再シャッフル）
            onClick={onRetryAll}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            もう一度全問解く 🔄
          </button>
          <button
            onClick={onGoHome}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            条件を変更してトップへ戻る 🏠
          </button>
        </div>
      </div>
    </main>
  );
}