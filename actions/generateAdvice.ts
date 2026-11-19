// actions/generateAdvice.ts
'use server';

import { GoogleGenAI } from '@google/genai';

// Gemini クライアントの初期化
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export type GenerateAdviceInput = {
  questionText: string;       // 問題文
  correctAnswer: unknown;     // 模範解答の仕訳
  userAnswer: unknown;        // ユーザーが入力した誤答の仕訳
};

export async function generateAdvice({
  questionText,
  correctAnswer,
  userAnswer,
}: GenerateAdviceInput) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: 'GEMINI_API_KEY が設定されていません。' };
    }

    // 簿記の先生として解説させるシステムプロンプトの作成
    const prompt = `
あなたは優しく丁寧な簿記講師です。
簿記の仕訳問題で生徒が不正解になりました。以下の情報をもとに、生徒がどこを誤解しているか、どのように考えれば正解できるかを簡潔に解説してください。

【問題文】
${questionText}

【正しい仕訳（模範解答）】
${JSON.stringify(correctAnswer, null, 2)}

【生徒の回答（誤答）】
${JSON.stringify(userAnswer, null, 2)}

【回答のルール】
- 150文字〜200文字程度で簡潔にまとめてください。
- 借方・貸方の勘定科目の選び方や金額の計算でどこが間違っているかを優しく指摘してください。
- 励ましの言葉を1文添えてください。
- 専門用語を使いすぎず、初心者にも分かりやすい表現にしてください。
`;

    // gemini-3.5-flash-lite モデルを使用してテキスト生成
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    const adviceText = response.text;

    return {
      success: true,
      advice: adviceText ?? 'アドバイスの生成に失敗しました。',
    };
  } catch (error) {
    console.error('❌ Gemini API エラー:', error);
    return {
      success: false,
      error: 'AIアドバイスの生成中にエラーが発生しました。',
    };
  }
}