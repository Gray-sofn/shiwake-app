# 簿記仕訳演習 ＆ AIサポートアプリ 📖🤖

簿記学習者が効率的に仕訳をマスターするためのWebアプリケーションです。
単元別の演習・ランダム出題に加え、不正解時には **Gemini API** が「なぜ間違えたのか」「正しい考え方のコツ」を個別にアドバイスしてくれます。未ログインのゲスト利用と、ログインによる手厚い学習履歴管理（マイページ・DB連携）を両立させたハイブリッド設計が特徴です。

---

## 🌟 主な機能

### 1. 仕訳演習 ＆ リアルタイム判定
- **単元別 / 全問題演習**: 資産・負債・純資産・収益・費用などのカテゴリ絞り込み出題。
- **出題オプション**: ランダム出題、出題数制限（5問/10問/全問など）。
- **複合仕訳対応**: 借方・貸方の複数行入力や勘定科目・金額の柔軟な照合判定。

### 2. 🤖 Gemini AIアドバイス機能（ログインユーザー限定）
- **パーソナライズ解説**: 不正解時、AI（Gemini 2.5 Flash）が問題文・模範解答・ユーザーの誤答内容を分析し、150〜200文字で分かりやすい解き方のコツを自動生成。
- **非同期レンダリング**: 固定の模範解答を即座に表示し、AIアドバイスはバックグラウンドで取得することでスピーディな操作感（UX）を実現。

### 3. 🔥 ハイブリッド復習（要復習）モード
- **ゲストユーザー**: `localStorage` を使用し、ブラウザ上で間違えた問題を即座に解き直し。
- **ログインユーザー**: Supabase DB (`AnswerLog`) の最新回答履歴から「現在まだ克服できていない誤答」を正確に抽出し、複数端末間でも同期された復習を提供。

### 4. 📊 マイページ ＆ 学習ノート（ログインユーザー限定）
- **学習統計サマリー**: 通算解答数、正解数、通算正答率をリアルタイム集計。
- **AI誤答ノート**: 過去に間違えた問題と、その時生成された AI アドバイスをタイムライン形式で振り返り可能。

### 5. 🔐 柔軟な認証 ＆ ユーザー同期
- **Clerk 認証**: モーダルによるスムーズなサインイン / サインアップ。
- **Clerk Webhook ➔ Supabase**: サインアップ時に Svix 署名検証を経て、Supabase (`User` テーブル) へ自動ユーザー同期。
- **ゲスト対応**: 未ログインでも基本演習が可能。ゲスト時は API 呼び出しや DB 書き込みを全自動スキップし、サーバー負荷と API コストを最小化。

---

## 🛠️ 技術スタック

| カテゴリ | 技術・サービス |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router / React 19) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Authentication** | Clerk (`@clerk/nextjs`) |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma 7 (`@prisma/client`) |
| **AI / LLM** | Google Gemini API (`@google/genai` / `gemini-3.5-flash-light`) |
| **Webhook / Mail** | Svix, Resend |

---

## 📐 データベース設計 (Prisma Schema)

```prisma
model User {
  id        String      @id // Clerk User ID (user_...)
  email     String      @unique
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  answers   AnswerLog[]
}

model AnswerLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  questionId  String
  isCorrect   Boolean
  userAnswer  Json?    // 不正解時のユーザー入力データ（正解時は null でDB節約）
  aiAdvice    String?  // 生成されたAIアドバイス（正解時は null）
  createdAt   DateTime @default(now())
}