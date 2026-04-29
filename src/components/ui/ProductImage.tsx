import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { cn, safeImage } from "../../lib/utils";

type ProductImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  seed: string;
};

export function ProductImage({ seed, src, alt, className, ...props }: ProductImageProps) {
  const fallback = safeImage(seed);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [src, fallback]);

  return (
    <img
      {...props}
      className={cn("bg-orange-50", className)}
      src={currentSrc || fallback}
      alt={alt || seed}
      onError={() => setCurrentSrc(fallback)}
    />
  );
}
