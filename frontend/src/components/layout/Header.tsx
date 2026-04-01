"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-dark">
          한코두코
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-6">
          {!isLoading && (
            <div className="flex items-center">
              {user ? (
                <>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/orders"
                      className={`text-sm font-medium transition-colors hover:text-primary-dark ${
                        pathname === "/orders"
                          ? "text-primary-dark"
                          : "text-foreground/60"
                      }`}
                    >
                      내 주문
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className={`text-sm font-medium transition-colors hover:text-primary-dark ${
                          pathname.startsWith("/admin")
                            ? "text-primary-dark"
                            : "text-foreground/60"
                        }`}
                      >
                        관리자
                      </Link>
                    )}
                  </div>
                  <span className="mx-3 text-foreground/20">|</span>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/mypage"
                      className={`text-sm font-medium transition-colors hover:text-primary-dark ${
                        pathname === "/mypage"
                          ? "text-primary-dark"
                          : "text-foreground/70"
                      }`}
                    >
                      {user.name}님
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          aria-label="메뉴 열기"
        >
          <span
            className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
              menuOpen ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
              menuOpen ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </button>
      </nav>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-primary/10 bg-white/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/orders"
                      onClick={closeMenu}
                      className={`block py-2 text-sm font-medium transition-colors ${
                        pathname === "/orders"
                          ? "text-primary-dark"
                          : "text-foreground/60"
                      }`}
                    >
                      내 주문
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className={`block py-2 text-sm font-medium transition-colors ${
                          pathname.startsWith("/admin")
                            ? "text-primary-dark"
                            : "text-foreground/60"
                        }`}
                      >
                        관리자
                      </Link>
                    )}
                    <hr className="border-primary/10" />
                    <Link
                      href="/mypage"
                      onClick={closeMenu}
                      className={`block py-2 text-sm font-medium transition-colors ${
                        pathname === "/mypage"
                          ? "text-primary-dark"
                          : "text-foreground/60"
                      }`}
                    >
                      마이페이지
                    </Link>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-foreground/70">
                        {user.name}님
                      </span>
                      <button
                        onClick={() => {
                          logout();
                          closeMenu();
                        }}
                        className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block text-center py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    로그인
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
