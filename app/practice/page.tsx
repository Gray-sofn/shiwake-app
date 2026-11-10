'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Question, JournalEntryLine } from '@/types/question';
import { JournalForm } from '@/components/practice/JournalForm';
import { ExplanationCard } from '@/components/practice/ExplanationCard';
import { ResultView } from '@/components/practice/ResultView';
import { getWrongQuestionIds, addWrongQuestionId, removeWrongQuestionId } from '@/utils/storage';

// 1行分の入力状態の型定義
interface RowInput {
  account: string;
  amount: string;
}

// 5行分の初期値を作成するヘルパー
const createInitialRows = (): RowInput[] =>
  Array(5)
    .fill(null)
    .map(() => ({ account: '', amount: '' }));

// 3桁区切りカンマのフォーマット用ヘルパー関数
const formatWithCommas = (val: string): string => {
  const cleanNum = val.replace(/,/g, '').trim();
  if (!cleanNum || isNaN(Number(cleanNum))) return val;
  return Number(cleanNum).toLocaleString();
};

// カンマを除去するヘルパー関数
const unformatCommas = (val: string): string => val.replace(/,/g, '');

// 配列をランダムに並び替える関数（Fisher-Yates シャッフル）
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 演習画面のメインコンテンツ
function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ① URLのクエリパラメータを取得
  const selectedCategory = searchParams.get('category');
  const isRandom = searchParams.get('order') === 'random';
  const limitParam = searchParams.get('limit');
  const limitCount = limitParam ? Number(limitParam) : 10;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 借方・貸方それぞれ固定5行の入力状態
  const [debitRows, setDebitRows] = useState<RowInput[]>(createInitialRows());
  const [creditRows, setCreditRows] = useState<RowInput[]>(createInitialRows());

  // 判定と解説表示フラグ
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 得点（正解数）と間違えた問題の保持と演習終了フラグ
  const [score, setScore] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // データ初期化
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const res = await fetch('/api/questions');
        let data: Question[] = await res.json();

        // 1. 単元（カテゴリ）による絞り込み
        // ★ 「要復習」モードの場合、localStorageに保存されたIDの問題だけを抽出
        if (selectedCategory === 'review') {
          const wrongIds = getWrongQuestionIds();
          data = data.filter((q) => wrongIds.includes(q.id));
        } else if (selectedCategory && selectedCategory !== 'すべて') {
          data = data.filter((q) => q.category === selectedCategory);
        }
        // 2. ランダム出題の適用
        if (isRandom) {
          data = shuffleArray(data);
        }
        // 3. 指定出題数分にスライス
        if (limitCount > 0) {
          data = data.slice(0, limitCount);
        }

        setQuestions(data);
        resetState();
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [selectedCategory, isRandom, limitCount]);

  // 全状態をリセットするヘルパー関数
  const resetState = () => {
    // 条件が変わったり再読込した際は、必ず1問目＆入力状態を初期化する
    setCurrentIndex(0);
    setScore(0);
    setWrongQuestions([]);  // 誤答リストもクリア
    setIsFinished(false);
    setDebitRows(createInitialRows());
    setCreditRows(createInitialRows());
    setIsAnswered(false);
    setIsCorrect(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">問題を読み込み中...</div>;

  // 該当する問題がない場合の表示
  if (questions.length === 0) {
    return (
      <main className="max-w-md mx-auto p-8 text-center space-y-4">
        <p className="text-gray-700">
          該当する問題が見つかりませんでした。
          {selectedCategory && <span className="block font-bold mt-1">（単元: {selectedCategory}）</span>}
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          トップページへ戻る
        </button>
      </main>
    );
  }

  // 結果画面表示
  if (isFinished) {
    return (
      <ResultView
        score={score}
        totalQuestions={questions.length}
        wrongCount={wrongQuestions.length}
        onRetryWrong={() => {
          setQuestions(wrongQuestions);
          resetState();
        }}
        onRetryAll={() => {
          let resetQ = [...questions];
          if (isRandom) resetQ = shuffleArray(resetQ);
          setQuestions(resetQ);
          resetState();
        }}
        onGoHome={() => router.push('/')}
      />
    );
  }

  const currentQuestion = questions[currentIndex];

  // 入力変更ハンドラー
  // 借方入力欄の更新
  const handleDebitChange = (index: number, field: 'account' | 'amount', value: string) => {
    setDebitRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 貸方入力欄の更新
  const handleCreditChange = (index: number, field: 'account' | 'amount', value: string) => {
    setCreditRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // カンマフォーマットハンドラー
  // 借方入力欄のフォーカスアウト（onBlur）処理
  const handleDebitBlur = (index: number) => {
    setDebitRows((prev) => {
      const updated = [...prev];
      updated[index].amount = formatWithCommas(updated[index].amount);
      return updated;
    });
  };

  // 借方入力欄のフォーカスイン（onFocus）処理
  const handleDebitFocus = (index: number) => {
    setDebitRows((prev) => {
      const updated = [...prev];
      updated[index].amount = unformatCommas(updated[index].amount);
      return updated;
    });
  };

  // 貸方入力欄のフォーカスアウト（onBlur）処理
  const handleCreditBlur = (index: number) => {
    setCreditRows((prev) => {
      const updated = [...prev];
      updated[index].amount = formatWithCommas(updated[index].amount);
      return updated;
    });
  };

  // 貸方入力欄のフォーカスイン（onFocus）処理
  const handleCreditFocus = (index: number) => {
    setCreditRows((prev) => {
      const updated = [...prev];
      updated[index].amount = unformatCommas(updated[index].amount);
      return updated;
    });
  };

  // 回答チェック処理
  const handleCheckAnswer = () => {
    const solution = currentQuestion.solution;
    const targetDebits: JournalEntryLine[] = Array.isArray(solution.debit) ? solution.debit : [solution.debit];
    const targetCredits: JournalEntryLine[] = Array.isArray(solution.credit) ? solution.credit : [solution.credit];

    // カンマを除去して数値判定
    const activeDebits = debitRows.filter((r) => r.account !== '' && Number(r.amount.replace(/,/g, '')) > 0);
    const activeCredits = creditRows.filter((r) => r.account !== '' && Number(r.amount.replace(/,/g, '')) > 0);

    // 照合判定ロジック（順番を問わず内容が一致するか）
    const isSideCorrect = (userList: RowInput[], targetList: JournalEntryLine[]) => {
      if (userList.length !== targetList.length) return false;
      const remainingUser = [...userList];
      for (const target of targetList) {
        const matchIdx = remainingUser.findIndex(
          (u) => u.account === target.account && Number(u.amount.replace(/,/g, '')) === target.amount
        );
        if (matchIdx === -1) return false;
        remainingUser.splice(matchIdx, 1);
      }
      return true;
    };

    const debitCorrect = isSideCorrect(activeDebits, targetDebits);
    const creditCorrect = isSideCorrect(activeCredits, targetCredits);
    const correct = debitCorrect && creditCorrect;

    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1); // 正解数を加算
      // ★ 正解した問題は localStorage の誤答リストから削除
      removeWrongQuestionId(currentQuestion.id);
    } else {
      // ★ 不正解の場合、間違えた問題リストに追加する
      setWrongQuestions((prev) => [...prev, currentQuestion]);
      // ★ 間違えた問題は localStorage の誤答リストに追加
      addWrongQuestionId(currentQuestion.id);
    }
    setIsAnswered(true);
  };

  // 次の問題へ進む処理
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setDebitRows(createInitialRows());
      setCreditRows(createInitialRows());
      setIsAnswered(false);
      setIsCorrect(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true); // 全問終了で結果画面へ
    }
  };

  // 回答ボタンを有効化する条件（借方・貸方に少なくとも1つ以上入力があるか）
  const canSubmit =
    debitRows.some((r) => r.account !== '' && Number(r.amount.replace(/,/g, '')) > 0) &&
    creditRows.some((r) => r.account !== '' && Number(r.amount.replace(/,/g, '')) > 0);

  const targetDebits: JournalEntryLine[] = Array.isArray(currentQuestion.solution.debit)
    ? currentQuestion.solution.debit
    : [currentQuestion.solution.debit];
  const targetCredits: JournalEntryLine[] = Array.isArray(currentQuestion.solution.credit)
    ? currentQuestion.solution.credit
    : [currentQuestion.solution.credit];

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      {/* ナビゲーションバー */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
        >
          ← トップへ戻る
        </button>
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          {isRandom ? '🔀 ランダム出題中' : '順番に出題中'}
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-4">商業簿記3級 仕訳練習</h1>

      {/* 問題カード */}
      <div className="bg-gray-50 border p-4 rounded-lg mb-6">
        <div className="text-sm text-gray-500 mb-1">
          第 {currentIndex + 1} 問 / 全 {questions.length} 問 [{currentQuestion.category}]
        </div>
        <p className="text-lg font-medium">{currentQuestion.question}</p>
      </div>

      {/* 5行仕訳フォームコンポーネント */}
      <JournalForm
        options={currentQuestion.options}
        debitRows={debitRows}
        creditRows={creditRows}
        isAnswered={isAnswered}
        onDebitChange={handleDebitChange}
        onCreditChange={handleCreditChange}
        onDebitBlur={handleDebitBlur}
        onDebitFocus={handleDebitFocus}
        onCreditBlur={handleCreditBlur}
        onCreditFocus={handleCreditFocus}
      />

      {/* 回答ボタン または 解説コンポーネント */}
      {!isAnswered ? (
        <button
          onClick={handleCheckAnswer}
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
        >
          回答する
        </button>
      ) : (
        /* 正否判定 & 解説表示 */
        <ExplanationCard
          isCorrect={isCorrect}
          targetDebits={targetDebits}
          targetCredits={targetCredits}
          explanation={currentQuestion.explanation}
          isLastQuestion={currentIndex === questions.length - 1}
          onNextQuestion={handleNextQuestion}
        />
      )}
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-600">読み込み中...</div>}>
      <PracticeContent />
    </Suspense>
  );
}