"use client";

import { useState } from "react";

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e9edc9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23b08455' font-size='48'%3E%F0%9F%A7%B6%3C/text%3E%3C/svg%3E";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function FallbackImage({
  src,
  alt,
  className,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(FALLBACK_SRC)}
    />
  );
}
