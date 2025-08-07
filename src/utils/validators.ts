import { z } from 'zod';
import { ValidationError } from '../types/errors.js';

// Basic schema definitions
export const VideoIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: 'Invalid video ID',
});

export const LanguageCodeSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, {
  message: 'Invalid language code (e.g., ja, en-US)',
});

export const FormatSchema = z.enum(['raw', 'srt', 'vtt'], {
  errorMap: () => ({ message: 'Format must be one of: raw, srt, vtt' }),
});

// Extract video ID from YouTube URL
export function extractVideoId(input: string): string {
  // If already a video ID
  if (VideoIdSchema.safeParse(input).success) {
    return input;
  }

  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new ValidationError('Please provide a valid YouTube URL or video ID', {
    input,
    examples: [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'dQw4w9WgXcQ',
    ],
  });
}

// Video info request validation
export const GetVideoInfoRequestSchema = z.object({
  video_id: z.string().transform(extractVideoId),
});

// Captions list request validation
export const GetCaptionsListRequestSchema = z.object({
  video_id: z.string().transform(extractVideoId),
});

// Caption download request validation
export const DownloadCaptionsRequestSchema = z.object({
  video_id: z.string().transform(extractVideoId),
  lang: LanguageCodeSchema,
  format: FormatSchema.optional().default('raw'),
});

// Video search request validation
export const SearchVideosRequestSchema = z.object({
  query: z.string().min(1, 'Please enter a search query'),
  lang: LanguageCodeSchema.optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

// Generic validation function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      
      throw new ValidationError(
        'Invalid input parameters',
        { errors: details }
      );
    }
    throw error;
  }
}

// Normalize language codes
export function normalizeLanguageCode(lang: string): string {
  // Normalize common language codes
  const normalized = lang.toLowerCase().replace('_', '-');
  
  // Common mappings
  const mappings: Record<string, string> = {
    'jp': 'ja',
    'japanese': 'ja',
    'english': 'en',
    'en-us': 'en',
    'en-gb': 'en',
  };

  return mappings[normalized] || normalized;
}

// Safe string sanitization
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .trim();
}

// Range validation for numbers
export function validateRange(
  value: number,
  min: number,
  max: number,
  name: string
): number {
  if (value < min || value > max) {
    throw new ValidationError(
      `${name} must be between ${min} and ${max}`,
      { value, min, max }
    );
  }
  return value;
}
