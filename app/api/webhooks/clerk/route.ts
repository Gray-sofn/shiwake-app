// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET が .env に設定されていません');
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not set' },
      { status: 500 }
    );
  }

  // リクエストヘッダーから Svix 署名情報を取得
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Svix ヘッダーが見つかりません');
    return NextResponse.json(
      { error: 'Missing Svix headers' },
      { status: 400 }
    );
  }

  // ペイロードの取得と署名検証
  // const payload = await req.json();
  // const body = JSON.stringify(payload);
  // 【修正1】生のテキストとして取得する（JSON.stringify による署名不一致を防ぐため）
  const body = await req.text();
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;

  try {
    wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
    evt = JSON.parse(body) as WebhookEvent;
  } catch (err) {
    console.error('❌ Webhook 署名検証エラー（Signing Secretが一致していない可能性があります）:', err);
    // 検証失敗時は即座にリターンして以降の処理を行わない
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  try {
    // 1. ユーザー作成・更新時 (user.created / user.updated)
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id } = evt.data;

      await prisma.user.upsert({
        where: { id },
        update: {},
        create: { id },
      });

      console.log(`[Webhook] User synced successfully: ${id}`);
    }

    // 2. ユーザー削除時 (user.deleted)
    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      if (id) {
        await prisma.user.delete({
          where: { id },
        });
        console.log(`[Webhook] User deleted successfully: ${id}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (dbError) {
    console.error('❌ DB処理（Prisma）でエラーが発生しました:', dbError);
    return NextResponse.json(
      { error: 'Database processing failed' },
      { status: 500 }
    );
  }
}


