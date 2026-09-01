"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

//Props 定義(このコンポーネントが外から受け取る値)
type UserAvatarProps = {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

//サイズ別 CSS 定義
const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
};

export default function UserAvatar({
  avatarUrl,
  name,
  size = "md",
  className = "",
}: UserAvatarProps) {
//画像エラー状態の管理
  const [hasImageError, setHasImageError] = useState(false);

  //fallback 表示用データ作成
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const shouldShowImage = Boolean(avatarUrl) && !hasImageError;

  return (
    <div
      className={[
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-600",
        sizeClasses[size],
        className,
      ].join(" ")}
      aria-label={name ? `${name}のプロフィール画像` : "プロフィール画像"}
    >
      {shouldShowImage ? (
        <img
          src={avatarUrl ?? ""}
          alt={name ? `${name}のプロフィール画像` : "プロフィール画像"}
          className="h-full w-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}