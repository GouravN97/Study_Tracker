/**
 * Utility functions for client-side image compression, resizing, and optimization.
 * Prevents localStorage QuotaExceededError and server PayloadTooLargeError
 * when users upload high-resolution wallpapers or course card covers.
 */

import { Course, UserSettings } from "../types";

/**
 * Resizes and compresses an image (File or base64 data URL) using an offscreen canvas.
 * Reduces 5MB-15MB phone/camera photos down to ~100KB-300KB with zero noticeable quality loss.
 */
export async function compressImage(
  source: File | string,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an external web URL (http/https) and not a data URL, return as is
    if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      return resolve(source);
    }

    // If source is already a very small data URL (< 50KB), no compression needed
    if (typeof source === "string" && source.startsWith("data:image/") && source.length < 50 * 1024) {
      return resolve(source);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          if (typeof source === "string") return resolve(source);
          return reject(new Error("Invalid image dimensions"));
        }

        // Calculate aspect-ratio-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (typeof source === "string") return resolve(source);
          return reject(new Error("Could not get 2D canvas context"));
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with chosen quality compression
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn("[ImageCompression] Canvas export failed, using fallback:", err);
        if (typeof source === "string") {
          resolve(source);
        } else {
          // Fallback to FileReader if canvas throws
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(source);
        }
      }
    };

    img.onerror = (err) => {
      console.warn("[ImageCompression] Image load failed:", err);
      if (typeof source === "string") {
        resolve(source);
      } else {
        reject(new Error("Failed to load image file"));
      }
    };

    if (typeof source === "string") {
      img.src = source;
    } else {
      const objectUrl = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(source);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = objectUrl;
    }
  });
}

/**
 * Checks if a string is a heavy base64 data URL (> thresholdBytes, default 300KB)
 */
export function isHeavyDataUrl(str?: string, thresholdBytes: number = 300 * 1024): boolean {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("data:image/") && str.length > thresholdBytes;
}

/**
 * Self-healing optimizer: scans courses and user settings for any oversized
 * uncompressed legacy images and compresses them in the background.
 */
export async function optimizeExistingMediaData(
  courses: Course[],
  settings: UserSettings
): Promise<{ courses: Course[]; settings: UserSettings; changed: boolean }> {
  let changed = false;
  let updatedSettings = { ...settings };
  let updatedCourses = [...courses];

  // Optimize custom background if it's a giant data URL (> 300KB)
  if (isHeavyDataUrl(settings.customBackgroundUrl, 300 * 1024)) {
    try {
      console.log(`[SelfHealing] Optimizing heavy custom background (${(settings.customBackgroundUrl!.length / 1024).toFixed(0)} KB)...`);
      const compressed = await compressImage(settings.customBackgroundUrl!, 1920, 1080, 0.82);
      updatedSettings.customBackgroundUrl = compressed;
      changed = true;
    } catch (e) {
      console.warn("[SelfHealing] Failed to optimize background image:", e);
    }
  }

  // Optimize course background images if heavy (> 200KB)
  for (let i = 0; i < updatedCourses.length; i++) {
    const course = updatedCourses[i];
    if (isHeavyDataUrl(course.backgroundImage, 200 * 1024)) {
      try {
        console.log(`[SelfHealing] Optimizing heavy background image for course "${course.name}" (${(course.backgroundImage!.length / 1024).toFixed(0)} KB)...`);
        const compressed = await compressImage(course.backgroundImage!, 1000, 700, 0.82);
        updatedCourses[i] = {
          ...course,
          backgroundImage: compressed,
        };
        changed = true;
      } catch (e) {
        console.warn(`[SelfHealing] Failed to optimize course image for "${course.name}":`, e);
      }
    }
  }

  return { courses: updatedCourses, settings: updatedSettings, changed };
}
