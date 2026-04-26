import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ScreenHeader } from "@/components/screen-header";
import { PopCard } from "@/components/ui/pop-card";
import { prisma } from "@/lib/db/prisma";

import { loginAction, registerAction } from "./actions";
import { LoginPanels } from "./login-panels";

const errorMessageMap: Record<string, string> = {
  register_validation: "新規登録の入力を確認してください。",
  user_exists: "同じメールまたはユーザー名が既に存在します。",
  login_validation: "ログイン入力を確認してください。",
  invalid_credentials: "メール・ユーザー名・パスワードの組み合わせが正しくありません。",
  credentials: "認証に失敗しました。入力内容を再確認してください。",
  configuration: "認証設定に問題があります。開発者に連絡してください。",
  session_stale: "セッションが期限切れです。再ログインしてください。",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true },
    });
    if (user) {
      redirect(user.onboardingCompletedAt ? "/recommend" : "/onboarding");
    }
  }

  const params = await searchParams;
  const errorMessage = params.error ? errorMessageMap[params.error] : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-10">
      <ScreenHeader
        title="ログイン"
        description="メールアドレス・ユーザー名・パスワードでログインします。初回は新規登録してください。"
      />
      {errorMessage && (
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-streaming)]">
          {errorMessage}
        </p>
      )}

      <LoginPanels loginAction={loginAction} registerAction={registerAction} />

      <PopCard tone="muted" className="mt-5 text-xs text-[var(--color-text-secondary)]">
        <p className="font-[500] text-[var(--color-text-primary)]">ローカル簡易ログイン</p>
        <ul className="mt-2 space-y-1">
          <li>- Google設定は不要です。</li>
          <li>- 右の「新規登録」でアカウント作成後、左の「ログイン」で入れます。</li>
          <li>- 登録後は `/onboarding` に進みます。</li>
        </ul>
      </PopCard>
    </main>
  );
}
