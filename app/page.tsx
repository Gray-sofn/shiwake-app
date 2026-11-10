'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/question';
import { getWrongQuestionIds, clearWrongQuestionIds } from '@/utils/storage';

export default function TopPage() {
  const router = useRouter();

  // 動的に取得するカテゴリ一覧の状態
  const [categories, setCategories] = useState<string[]>(['すべて']);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
  const [rawCatData, setRawCatData] = useState<string[]>([]); // クライアント用カテゴリ原紙

  // ① 出題順のデフォルトをランダム（true）にする
  const [isRandom, setIsRandom] = useState(true);
  // モード選択（現在は 'guest' のみ選択可、将来的に 'user' を追加）
  const [mode, setMode] = useState<'guest' | 'user'>('guest');

  // 出題数と選択単元内の最大問題数
  const [maxCount, setMaxCount] = useState(10);
  const [questionCount, setQuestionCount] = useState(10);

  // 初回レンダリング時にカテゴリ一覧と問題データを取得
  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await fetch('/api/categories');
        const catData: string[] = await catRes.json();
        // setCategories(catData);
        // ★ APIの返値から「すべて」を除外した純粋な単元リストを作成
        const cleanCatData = catData.filter((c) => c !== 'すべて');
        setRawCatData(catData);

        const qRes = await fetch('/api/questions');
        const qData: Question[] = await qRes.json();
        setAllQuestions(qData);

        // localStorageから間違えた問題のIDを取得
        const wrongIds = getWrongQuestionIds();
        setWrongQuestionIds(wrongIds);

        // 間違えた問題がある場合、選択肢の先頭に「要復習」を追加
        // ★ 先頭に「要復習」や「すべて」を重複なく結合
        if (wrongIds.length > 0) {
          setCategories([`🔥 要復習（${wrongIds.length}問）`, 'すべて', ...cleanCatData]);
        } else {
          setCategories(['すべて', ...cleanCatData]);
        }
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      }
    }
    fetchData();
  }, []);

  // 選択単元に応じた最大数の計算
  useEffect(() => {
    // const filtered =
    //   selectedCategory === 'すべて'
    //     ? allQuestions
    //     : allQuestions.filter((q) => q.category === selectedCategory);
    let filtered = allQuestions;

    if (selectedCategory.startsWith('🔥 要復習')) {
      filtered = allQuestions.filter((q) => wrongQuestionIds.includes(q.id));
    } else if (selectedCategory !== 'すべて') {
      filtered = allQuestions.filter((q) => q.category === selectedCategory);
    }

    const availableTotal = filtered.length > 0 ? filtered.length : 1;
    setMaxCount(availableTotal);

    // デフォルト値10（最大問題数が10未満の場合はその最大数に合わせる）
    const defaultVal = Math.min(10, availableTotal);
    setQuestionCount(defaultVal);
  }, [selectedCategory, allQuestions, wrongQuestionIds]);

  // ★ 復習履歴のクリア処理
  const handleClearHistory = () => {
    if (window.confirm('間違えた問題の履歴をすべてクリアしますか？')) {
      clearWrongQuestionIds();
      setWrongQuestionIds([]);
      setCategories(['すべて', ...rawCatData]);
      setSelectedCategory('すべて');
    }
  };

  // 出題数の直接入力ハンドラー
  const handleCountChange = (val: number) => {
    if (isNaN(val)) return;
    // 1 〜 maxCount の範囲に自動クランプ
    const clamped = Math.max(1, Math.min(val, maxCount));
    setQuestionCount(clamped);
  };

  // 演習開始処理
  const handleStart = () => {
    const params = new URLSearchParams();
    // if (selectedCategory !== 'すべて') {
    //   params.set('category', selectedCategory);
    // }
    // if (isRandom) {
    //   params.set('order', 'random');
    // }
    // params.set('limit', questionCount.toString());
    // params.set('mode', mode);
    if (selectedCategory.startsWith('🔥 要復習')) {
      params.set('category', 'review');
    } else if (selectedCategory !== 'すべて') {
      params.set('category', selectedCategory);
    }

    if (isRandom) {
      params.set('order', 'random');
    }
    params.set('limit', questionCount.toString());
    params.set('mode', mode);

    // `/practice?category=商品売買&order=random&mode=guest` のように遷移
    router.push(`/practice?${params.toString()}`);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 font-sans">
      {/* ヘッダーエリア */}
      <div className="text-center my-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">商業簿記3級 仕訳練習</h1>
        <p className="text-gray-600">サクサク解いて仕訳をマスターしよう！</p>
      </div>

      {/* モード選択エリア */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">利用モードの選択</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* ゲストモード */}
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={`p-4 border-2 rounded-xl text-left transition ${mode === 'guest'
              ? 'border-blue-600 bg-blue-50/50 text-blue-950'
              : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="font-bold mb-1">🚀 ゲストモード</div>
            <div className="text-xs text-gray-500">ログイン不要ですぐに解き始められます</div>
          </button>

          {/* ユーザーモード（開発予定） */}
          <button
            type="button"
            disabled
            className="p-4 border-2 border-gray-200 rounded-xl text-left bg-gray-50 opacity-60 cursor-not-allowed"
          >
            <div className="font-bold mb-1 text-gray-500">🔒 ユーザーモード</div>
            <div className="text-xs text-gray-400">フェーズ3で実装予定（履歴をクラウド保存）</div>
          </button>
        </div>
      </div>

      {/* 出題設定カード */}
      <div className="bg-white border p-6 rounded-xl shadow-sm mb-8 space-y-6">
        <h2 className="font-bold text-gray-800 border-b pb-2 text-lg">出題設定</h2>

        {/* 単元選択ドロップダウン */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
              対象の単元
            </label>
            {/* ★ 誤答履歴が存在する場合のみ表示されるクリアボタン */}
            {wrongQuestionIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium transition"
              >
                🗑️ 復習履歴をクリア
              </button>
            )}
          </div>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border p-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 出題数の指定（input直接入力） */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="count-input" className="block text-sm font-medium text-gray-700">
              出題数（問）
            </label>
            <span className="text-xs text-gray-500">
              全 {maxCount} 問中
            </span>
          </div>
          <input
            id="count-input"
            type="number"
            min={1}
            max={maxCount}
            value={questionCount}
            onChange={(e) => handleCountChange(Number(e.target.value))}
            className="w-full border p-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 出題順（ランダム切り替え） */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="font-medium text-gray-800 text-sm">出題順序</div>
            <div className="text-xs text-gray-500">オンにすると問題をランダム順で出題します</div>
          </div>
          <button
            type="button"
            onClick={() => setIsRandom(!isRandom)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRandom ? 'bg-blue-600' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRandom ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* スタートボタン */}
      <button
        onClick={handleStart}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition text-lg"
      >
        練習を始める ➔
      </button>
    </main>
  );
}