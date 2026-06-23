/**
 * Optimized Image Component
 * Implements lazy loading, responsive images, and format optimization
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  quality?: number;
}

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading for off-screen images
 * - Responsive images with srcset
 * - WebP format support with fallback
 * - Blur placeholder while loading
 * - Error handling
 */
export const OptimizedImage = React.memo(function OptimizedImageComponent({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  onLoad,
  onError,
  placeholder = 'blur',
  quality = 75,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate WebP version of the image
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  // Generate responsive image sizes
  const generateSrcSet = (imageSrc: string): string => {
    const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    return sizes
      .map((size) => {
        const resizedUrl = imageSrc.includes('?')
          ? `${imageSrc}&w=${size}&q=${quality}`
          : `${imageSrc}?w=${size}&q=${quality}`;
        return `${resizedUrl} ${size}w`;
      })
      .join(', ');
  };

  const aspectRatio = width && height ? (height / width) * 100 : undefined;

  return (
    <picture>
      {/* WebP format for modern browsers */}
      <source srcSet={generateSrcSet(webpSrc)} type="image/webp" sizes={sizes} />

      {/* Fallback to original format */}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          !isLoaded && placeholder === 'blur' && 'blur-sm',
          isLoaded && 'blur-0',
          hasError && 'opacity-50',
          className
        )}
        style={
          aspectRatio
            ? {
                aspectRatio: `${width} / ${height}`,
              }
            : undefined
        }
      />

      {/* Error fallback */}
      {hasError && (
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground',
            className
          )}
          style={
            aspectRatio
              ? {
                  aspectRatio: `${width} / ${height}`,
                }
              : { width, height }
          }
        >
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Image Optimization Utilities
 */
export const imageOptimization = {
  /**
   * Generate WebP version of image URL
   */
  toWebP: (url: string): string => {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  },

  /**
   * Generate resized image URL
   */
  resize: (url: string, width: number, height?: number, quality: number = 75): string => {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());

    return url.includes('?') ? `${url}&${params.toString()}` : `${url}?${params.toString()}`;
  },

  /**
   * Generate responsive image srcset
   */
  generateSrcSet: (url: string, quality: number = 75): string => {
    const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    return sizes
      .map((size) => {
        const resizedUrl = imageOptimization.resize(url, size, undefined, quality);
        return `${resizedUrl} ${size}w`;
      })
      .join(', ');
  },

  /**
   * Get optimal image size based on device
   */
  getOptimalSize: (): number => {
    if (typeof window === 'undefined') return 1200;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;

    return Math.ceil(width * dpr);
  },

  /**
   * Preload image
   */
  preload: (url: string): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  },

  /**
   * Prefetch image
   */
  prefetch: (url: string): void => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },
};
