import { NextResponse } from 'next/server';
import questionsData from '@/data/questions.json';

export async function GET() {
  // 本来はここでデータベース検索などを行います
  // 今回はJSONファイルの中身をそのまま返します
  return NextResponse.json(questionsData);
}