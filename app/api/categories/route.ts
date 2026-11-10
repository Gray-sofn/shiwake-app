import { NextResponse } from 'next/server';
import questionsData from '@/data/questions.json';

export async function GET() {
  // JSONから category だけを抽出し、Set を使って重複を削除
  const categories = Array.from(
    new Set(questionsData.map((q) => q.category))
  );

  // 先頭に「すべて」を追加して返す
  return NextResponse.json(['すべて', ...categories]);
}