"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const inputBase =
  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
const inputNormal = `${inputBase} border-primary/20 focus:ring-primary/50`;
const inputError = `${inputBase} border-red-400 focus:ring-red-300 bg-red-50/30`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "로그인에 실패했습니다";
      // 이메일/비밀번호 관련 에러는 비밀번호 필드에 표시
      setFieldErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          로그인
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-sm"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-1"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors({});
              }}
              className={fieldErrors.password ? inputError : inputNormal}
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-1"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors({});
              }}
              className={fieldErrors.password ? inputError : inputNormal}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <p className="mt-4 text-center text-sm text-foreground/60">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-primary-dark hover:underline font-medium"
            >
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
