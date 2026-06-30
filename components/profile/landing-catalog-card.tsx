"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { LandingCategory } from "@/lib/practice-solutions/landing-page-model";
import { LANDING_IMG } from "@/lib/practice-solutions/landing-configs/shared-images";

type Props = {
  category: LandingCategory;
  onBook: (category: LandingCategory) => void;
};

export function LandingCatalogCard({ category, onBook }: Props) {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(category.image);
  const hasPreview = Boolean(category.previewHref);

  const handleCardClick = () => {
    if (category.previewHref) {
      router.push(category.previewHref);
      return;
    }
    onBook(category);
  };

  return (
    <li className="yd-cl-catalog__item">
      <button
        type="button"
        className="yd-cl-catalog__card"
        onClick={handleCardClick}
        aria-label={
          hasPreview
            ? `${category.title} — Beispielvorlage ansehen`
            : `${category.title} — anfragen`
        }
      >
        <div className="yd-cl-catalog__preview">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="yd-cl-catalog__image"
            style={
              category.imagePosition
                ? { objectPosition: category.imagePosition }
                : undefined
            }
            onError={() => {
              if (imageSrc !== LANDING_IMG.default) {
                setImageSrc(LANDING_IMG.default);
              }
            }}
          />
          {hasPreview ? (
            <span className="yd-cl-catalog__preview-badge">Beispielvorlage</span>
          ) : null}
        </div>

        <div className="yd-cl-catalog__foot">
          <div className="yd-cl-catalog__meta">
            <p className="yd-cl-catalog__category">{category.categoryLabel}</p>
            <p className="yd-cl-catalog__title">{category.title}</p>
          </div>
          <ChevronRight className="yd-cl-catalog__chevron" aria-hidden />
        </div>
      </button>
      {hasPreview ? (
        <button
          type="button"
          className="yd-cl-catalog__inquire"
          onClick={() => onBook(category)}
        >
          Anfragen
        </button>
      ) : null}
    </li>
  );
}
