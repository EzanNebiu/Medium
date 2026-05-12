import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { cn, safeImage } from "../../lib/utils";

type ProductImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  seed: string;
  priority?: boolean;
};

export function ProductImage({ seed, src, alt, className, priority, ...props }: ProductImageProps) {
  const fallback = safeImage(seed);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallback);
      return;
    }

    // Preload new image before switching
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setHasError(false);
    };
    img.onerror = () => {
      setCurrentSrc(fallback);
      setHasError(true);
    };
  }, [src, fallback]);

  return (
    <img
      {...props}
      className={cn("bg-orange-50", className)}
      src={currentSrc || fallback}
      alt={alt || seed}
      loading={priority ? "eager" : "lazy"}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(fallback);
        }
      }}
    />
  );
}
