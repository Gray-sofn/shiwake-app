# 簿記仕訳演習 ＆ AIサポートアプリ 📖🤖

簿記学習者が効率的に仕訳をマスターするためのWebアプリケーションです。
手形問題を除外し、電子記録債権・債務やクレジット売掛金などの現代的な試験・実務傾向に沿った問題（全50問）を搭載。不正解時には **Gemini 3.5 Flash-lite** を活用した AI 講師が「なぜ間違えたのか」「正しい考え方のコツ」を即座にアドバイスしてくれます。

未ログインでの手軽なゲスト利用と、ログインユーザー向けの手厚い学習履歴管理（マイページ・クラウド同期・AI誤答ノート）を両立したハイブリッド設計が特徴です。

---

## 🌟 発表用ハイライト（本プロダクトの強み・設計上の工夫点）

1. **現代の出題傾向に対応した問題セット（全50問）**
   - 試験範囲から除外・縮小傾向にある手形問題を減らし、「電子記録債権・債務」「クレジット売掛金」「決算整理（経過勘定・貸倒引当金）」「固定資産・減価償却」など現代の最頻出テーマを中心に網羅。
2. **高速・低コストな AI 活用（Gemini 3.5 Flash-lite）**
   - 高度な解説力と優れたレスポンス速度・コストパフォーマンスを兼ね備えた **Gemini 3.5 Flash-lite** を採用。不正解時かつログイン時のみ API を非同期で呼び出すことで、APIコストとサーバー負荷を最小化。
3. **UX（ユーザー体験）を損なわない非同期レンダリング**
   - 答え合わせ判定と固定解説を「0秒」で即座に表示し、AIアドバイスはバックグラウンドでフェッチ。AIの生成待ちによる画面フリーズ感を排除。
4. **ゲスト / ログインのハイブリッド復習システム**
   - ゲストユーザーは `localStorage` でブラウザ上で手軽に復習可能。
   - ログインユーザーは Supabase DB から「現在まだ克服できていない誤答問題（最新回答が不正解のもの）」を自動抽出し、マルチデバイス間での完全同期復習を実現。
5. **Vercel Cron Jobs による自動スリープ防止（Keep-Alive）**
   - Supabase 無料プランの完全休止（7日間無アクセスによるスリープ）を防止するため、Cron Jobs で定期的に軽量クエリを発行し常時アクティブ状態を維持。

---

## 🛠️ 機能一覧

### 1. 仕訳演習 ＆ リアルタイム判定
- **単元別 / 全問題演習**: 資産・負債・純資産・収益・費用・決算整理等のカテゴリ絞り込み出題。
- **柔軟な出題オプション**: ランダム出題、出題数制限（5問/10問/全問）。
- **複合仕訳照合**: 借方・貸方の複数行入力や勘定科目・金額の柔軟な自動判定。

### 2. 🤖 Gemini AIアドバイス機能（ログインユーザー限定）
- **パーソナライズ解説**: 不正解時、AI（Gemini 3.5 Flash-lite）が問題文・模範解答・ユーザーの誤答内容を解析し、150〜200文字で分かりやすい解き方のコツを自動生成。
- **非同期読み込み**: 生成待ちの間も画面の操作性を損なわず、「AIが解説を作成中...」から自然に表示へ切り替え。

### 3. 🔥 ハイブリッド復習（要復習）モード
- **ゲストユーザー**: ブラウザの `localStorage` に誤答IDを保存・管理。
- **ログインユーザー**: Supabase (`AnswerLog`) の全回答履歴から、各問題の「最新の回答結果が不正解のもの」だけを動的に抽出して出題。正解すると自動的にリストから除外。

### 4. 📊 マイページ ＆ AI誤答ノート（ログインユーザー限定）
- **学習統計サマリー**: 通算解答数、正解数、通算正答率をリアルタイム集計。
- **AI誤答ノート**: 過去に間違えた問題と生成された AI アドバイスをタイムライン形式で振り返り可能。

### 5. 🔐 柔軟な認証 ＆ ユーザー同期
- **Clerk 認証**: モーダルによるスムーズなサインイン / サインアップ。
- **Clerk Webhook ➔ Supabase**: サインアップ時に Svix 署名検証を経て `User` テーブルへ自動同期。
- **セキュリティ ＆ コスト保護**: 未ログイン時は API 呼び出し・DB 書き込みを全自動スキップ。

---

## 🛠️ 技術スタック

| カテゴリ | 技術・サービス | 選定理由・役割 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router / React 19) | Server Actions, API Routes, 高速なレンダリング |
| **Language** | TypeScript | 型安全な開発、誤答データ構造の厳密な定義 |
| **Styling** | Tailwind CSS | レスポンシブ対応・モダンなUIデザイン |
| **Authentication** | Clerk (`@clerk/nextjs`) | モーダル認証、セッション管理、保護ルート制御 |
| **Database** | Supabase (PostgreSQL) | クラウドDB、AnswerLog および User データの保持 |
| **ORM** | Prisma 7 (`@prisma/client`) | 型安全な DB 操作、SQLインジェクションの完全防止 |
| **AI / LLM** | Google Gemini API (`gemini-3.5-flash-lite`) | 高速かつ低コストな不正解時アドバイス自動生成 |
| **Automation** | Vercel Cron Jobs | Supabase の自動スリープ（休止）防止 Keep-Alive |
| **Security / Utility** | Svix | Clerk Webhook の署名検証（なりすまし防止） |

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
  userAnswer  Json?    // 不正解時のユーザー入力（正解時は null でDB容量節約）
  aiAdvice    String?  // 生成されたAIアドバイス（正解時は null）
  createdAt   DateTime @default(now())
}