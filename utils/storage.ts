const STORAGE_KEY = 'bookkeeping_wrong_question_ids';

// 過去に間違えた問題IDの配列を取得
export const getWrongQuestionIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('localStorageからの読み込みに失敗しました:', error);
    return [];
  }
};

// 誤答リストにIDを追加（重複は防ぐ）
export const addWrongQuestionId = (id: string): void => {
  if (typeof window === 'undefined') return;
  const current = getWrongQuestionIds();
  if (!current.includes(id)) {
    const updated = [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};

// 正解した問題を誤答リストから削除
export const removeWrongQuestionId = (id: string): void => {
  if (typeof window === 'undefined') return;
  const current = getWrongQuestionIds();
  const updated = current.filter((item) => item !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// 誤答リストをすべてクリア
export const clearWrongQuestionIds = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};