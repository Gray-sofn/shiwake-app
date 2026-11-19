// components/Header.tsx
import Link from 'next/link';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* アプリタイトル（トップページへのリンク） */}
      <Link
        href="/"
        className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
      >
        簿記仕訳演習アプリ
      </Link>

      {/* 認証状態に応じたボタン表示 */}
      <div className="flex items-center gap-4">
        <Suspense>
          {/* 未ログイン時：ログインボタンを表示 */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                ログイン
              </button>
            </SignInButton>
          </Show>

          {/* ログイン済み：ユーザーアイコンを表示 */}
          <Show when="signed-in">
            {/* ★ マイページへのリンクを追加 */}
            <Link
              href="/mypage"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              マイページ
            </Link>
            <UserButton />
          </Show>
        </Suspense>
      </div>
    </header>
  );
}