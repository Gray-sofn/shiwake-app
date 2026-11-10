'use client';

import { JournalEntryLine } from '@/types/question';

interface ExplanationCardProps {
  isCorrect: boolean;
  targetDebits: JournalEntryLine[];
  targetCredits: JournalEntryLine[];
  explanation: string;
  isLastQuestion: boolean;
  onNextQuestion: () => void;
}

export function ExplanationCard({
  isCorrect,
  targetDebits,
  targetCredits,
  explanation,
  isLastQuestion,
  onNextQuestion,
}: ExplanationCardProps) {
  return (
    <div className="space-y-4">
      {/* 正否判定 */}
      <div
        className={`p-4 rounded-lg text-center font-bold text-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
      >
        {isCorrect ? '🎉 正解！' : '❌ 不正解...'}
      </div>

      {/* 模範解答 ＆ 解説 */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-800">
        <h3 className="font-bold mb-2 text-blue-900">【模範解答】</h3>
        <div className="grid grid-cols-2 gap-4 mb-3 border-b border-blue-200 pb-2">
          <div>
            <span className="font-semibold text-gray-700">（借方）</span>
            {targetDebits.map((d, i) => (
              <div key={`ans-d-${i}`}>
                {d.account}：{d.amount.toLocaleString()} 円
              </div>
            ))}
          </div>
          <div>
            <span className="font-semibold text-gray-700">（貸方）</span>
            {targetCredits.map((c, i) => (
              <div key={`ans-c-${i}`}>
                {c.account}：{c.amount.toLocaleString()} 円
              </div>
            ))}
          </div>
        </div>
        <h3 className="font-bold mb-1 text-blue-900">【解説】</h3>
        <p className="whitespace-pre-wrap">{explanation}</p>
      </div>

      {/* 次へ進む / 結果を見るボタン */}
      <button
        onClick={onNextQuestion}
        className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition"
      >
        {isLastQuestion ? '結果を見る 📊' : '次の問題へ進む ➔'}
      </button>
    </div>
  );
}