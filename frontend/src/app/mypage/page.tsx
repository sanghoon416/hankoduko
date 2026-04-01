"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "@/lib/api";
import type { UserProfile } from "@/types";

const inputBase =
  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
const inputNormal = `${inputBase} border-primary/20 focus:ring-primary/50`;
const inputError = `${inputBase} border-red-400 focus:ring-red-300 bg-red-50/30`;

export default function MyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 폼
  const [address, setAddress] = useState("");
  const [refundBank, setRefundBank] = useState("");
  const [refundAccount, setRefundAccount] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // 비밀번호 폼
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwFieldErrors, setPwFieldErrors] = useState<Record<string, string>>(
    {}
  );
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    getProfile()
      .then((data) => {
        setProfile(data);
        setAddress(data.address || "");
        setRefundBank(data.refundBank || "");
        setRefundAccount(data.refundAccount || "");
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMsg("");
    setProfileSaving(true);

    try {
      const updated = await updateProfile({
        address,
        refundBank,
        refundAccount,
      });
      setProfile(updated);
      setProfileMsg("저장되었습니다");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "저장에 실패했습니다"
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwFieldErrors({});
    setPwMsg("");

    const errors: Record<string, string> = {};

    if (newPassword.length < 4) {
      errors.newPassword = "비밀번호는 4자 이상이어야 합니다";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "새 비밀번호가 일치하지 않습니다";
    }

    if (Object.keys(errors).length > 0) {
      setPwFieldErrors(errors);
      return;
    }

    setPwSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwMsg("비밀번호가 변경되었습니다");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다";
      if (message.includes("현재 비밀번호")) {
        setPwFieldErrors({ currentPassword: message });
      } else {
        setPwFieldErrors({ currentPassword: message });
      }
    } finally {
      setPwSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-foreground/50 py-12">로딩 중...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-foreground/50 py-12">
          프로필을 불러올 수 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">마이페이지</h1>

      {/* 기본 정보 (읽기 전용) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">기본 정보</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-foreground/50">이메일</dt>
            <dd className="text-foreground">{profile.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-foreground/50">이름</dt>
            <dd className="text-foreground">{profile.name}</dd>
          </div>
        </dl>
      </div>

      {/* 배송지 / 환불 계좌 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          배송지 / 환불 계좌
        </h2>

        {profileMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            {profileMsg}
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-foreground mb-1"
            >
              주소
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputNormal}
              placeholder="서울시 강남구..."
            />
          </div>

          <div>
            <label
              htmlFor="refundBank"
              className="block text-sm font-medium text-foreground mb-1"
            >
              환불 은행
            </label>
            <input
              id="refundBank"
              type="text"
              value={refundBank}
              onChange={(e) => setRefundBank(e.target.value)}
              className={inputNormal}
              placeholder="국민은행"
            />
          </div>

          <div>
            <label
              htmlFor="refundAccount"
              className="block text-sm font-medium text-foreground mb-1"
            >
              환불 계좌번호
            </label>
            <input
              id="refundAccount"
              type="text"
              value={refundAccount}
              onChange={(e) => setRefundAccount(e.target.value)}
              className={inputNormal}
              placeholder="123-456-789012"
            />
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {profileSaving ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          비밀번호 변경
        </h2>

        {pwMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            {pwMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-foreground mb-1"
            >
              현재 비밀번호
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPwFieldErrors((prev) => {
                  const { currentPassword: _, ...rest } = prev;
                  return rest;
                });
              }}
              className={
                pwFieldErrors.currentPassword ? inputError : inputNormal
              }
            />
            {pwFieldErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {pwFieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-foreground mb-1"
            >
              새 비밀번호
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwFieldErrors((prev) => {
                  const { newPassword: _, ...rest } = prev;
                  return rest;
                });
              }}
              className={pwFieldErrors.newPassword ? inputError : inputNormal}
              placeholder="4자 이상"
            />
            {pwFieldErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {pwFieldErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground mb-1"
            >
              새 비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwFieldErrors((prev) => {
                  const { confirmPassword: _, ...rest } = prev;
                  return rest;
                });
              }}
              className={
                pwFieldErrors.confirmPassword ? inputError : inputNormal
              }
            />
            {pwFieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {pwFieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pwSaving}
            className="w-full py-3 bg-foreground text-white rounded-lg hover:bg-foreground/80 transition-colors font-medium disabled:opacity-50"
          >
            {pwSaving ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}
