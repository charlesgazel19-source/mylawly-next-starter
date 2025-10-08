"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar(){
  const pathname = usePathname();
  return (
    <div className="lw-topbar">
      <div className="lw-brand">
        <div className="lw-logo" />
        <h1 className="text-base font-semibold tracking-wide">MyLawly — Prototype</h1>
      </div>
      <div className="lw-tabs">
        <Link href="/" className={"lw-tab " + (pathname === "/" ? "lw-tab-active" : "")}>Vue Utilisateur</Link>
        <Link href="/admin" className={"lw-tab " + (pathname.startsWith("/admin") ? "lw-tab-active" : "")}>Vue Admin</Link>
      </div>
    </div>
  );
}
