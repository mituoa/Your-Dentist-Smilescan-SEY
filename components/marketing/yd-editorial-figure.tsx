"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type YdEditorialFigureProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  variant?: "hero" | "trust" | "ambient";
  className?: string;
  caption?: string;
};

/**
 * Premium editorial photography frame — warm glass, cinematic crop.
 */
export function YdEditorialFigure({
  src,
  alt,
  width,
  height,
  priority = false,
  variant = "ambient",
  className,
  caption,
}: YdEditorialFigureProps) {
  return (
    <figure
      className={cn(
        "yd-editorial-figure",
        variant === "hero" && "yd-editorial-figure--hero",
        variant === "trust" && "yd-editorial-figure--trust",
        variant === "ambient" && "yd-editorial-figure--ambient",
        className
      )}
    >
      <div className="yd-editorial-figure-frame">
        <div className="yd-editorial-figure-glow" aria-hidden />
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={
            variant === "hero"
              ? "(max-width: 960px) 100vw, 58vw"
              : variant === "trust"
                ? "(max-width: 768px) 100vw, 42vw"
                : "100vw"
          }
          className="yd-editorial-figure-img"
        />
        <div className="yd-editorial-figure-veil" aria-hidden />
      </div>
      {caption ? <figcaption className="yd-editorial-figure-caption">{caption}</figcaption> : null}
    </figure>
  );
}
