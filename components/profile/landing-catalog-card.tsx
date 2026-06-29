"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import type { LandingCategory } from "@/lib/practice-solutions/landing-page-model";
import { LANDING_IMG } from "@/lib/practice-solutions/landing-configs/shared-images";

type Props = {
  category: LandingCategory;
  onBook: (category: LandingCategory) => void;
};

export function LandingCatalogCard({ category, onBook }: Props) {
  const [imageSrc, setImageSrc] = useState(category.image);

  return (
    <li className="yd-cl-catalog__item">
      <button
        type="button"
        className="yd-cl-catalog__card"
        onClick={() => onBook(category)}
        aria-label={`${category.title} — anfragen`}
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
      </div>

      <div className="yd-cl-catalog__foot">
        <div className="yd-cl-catalog__meta">
          <p className="yd-cl-catalog__category">{category.categoryLabel}</p>
          <p className="yd-cl-catalog__title">{category.title}</p>
        </div>
        <ChevronRight className="yd-cl-catalog__chevron" aria-hidden />
      </div>
    </button>
    </li>
  );
}
