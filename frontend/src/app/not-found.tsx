import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-foreground/70">
        페이지를 찾을 수 없습니다
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
