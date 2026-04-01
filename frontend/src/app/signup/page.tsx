"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const inputBase =
  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
const inputNormal = `${inputBase} border-primary/20 focus:ring-primary/50`;
const inputError = `${inputBase} border-red-400 focus:ring-red-300 bg-red-50/30`;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (password.length < 4) {
      errors.password = "비밀번호는 4자 이상이어야 합니다";
    }
    if (password !== passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, name);
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "회원가입에 실패했습니다";
      if (message.includes("이메일")) {
        setFieldErrors({ email: message });
      } else {
        setFieldErrors({ email: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          회원가입
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-sm"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              이름
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              className={fieldErrors.name ? inputError : inputNormal}
              placeholder="홍길동"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

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
                clearFieldError("email");
              }}
              className={fieldErrors.email ? inputError : inputNormal}
              placeholder="email@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
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
                clearFieldError("password");
              }}
              className={fieldErrors.password ? inputError : inputNormal}
              placeholder="4자 이상"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-foreground mb-1"
            >
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                clearFieldError("passwordConfirm");
              }}
              className={fieldErrors.passwordConfirm ? inputError : inputNormal}
              placeholder="비밀번호를 다시 입력"
            />
            {fieldErrors.passwordConfirm && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.passwordConfirm}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <p className="mt-4 text-center text-sm text-foreground/60">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-primary-dark hover:underline font-medium"
            >
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
