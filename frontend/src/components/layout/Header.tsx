"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  const links = [
    { href: "/", label: "홈" },
    { href: "/products", label: "상품" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-dark">
          한코두코
        </Link>

        <div className="flex items-center gap-6">
          <ul className="flex gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-dark ${
                    pathname === link.href
                      ? "text-primary-dark"
                      : "text-foreground/60"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {!isLoading && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
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
                  <span className="text-sm text-foreground/70">
                    {user.name}님
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    로그아웃
                  </button>
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
      </nav>
    </header>
  );
}
