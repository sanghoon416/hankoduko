"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-foreground">오류</h1>
      <p className="mt-4 text-lg text-foreground/70 text-center">
        문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="mt-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
