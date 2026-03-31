"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/orders", label: "주문 관리" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0">
      <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 px-3">
          관리자
        </h2>
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary-dark"
                      : "text-foreground/60 hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
