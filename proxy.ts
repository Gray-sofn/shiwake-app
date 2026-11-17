// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 認証不要でアクセスできるパブリックルートを指定（トップページやログイン画面など）
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/test-db', // 先ほどのDBテスト用API
  '/api/webhooks(.*)', // ← ここを追加（Webhook用APIを保護対象から除外）
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // パブリックルート以外はログインが必要
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.jsの内部ファイルや静的ファイルを除外
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};