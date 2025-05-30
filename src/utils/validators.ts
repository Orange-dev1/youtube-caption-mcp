import { z } from 'zod';
import { ValidationError } from '../types/errors.js';

// 基本的なスキーマ定義
export const VideoIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: '無効な動画IDです',
});

export const LanguageCodeSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, {
  message: '無効な言語コードです（例: ja, en-US）',
});

export const FormatSchema = z.enum(['raw', 'srt', 'vtt'], {
  errorMap: () => ({ message: 'フォーマットはraw、srt、vttのいずれかを指定してください' }),
});

// YouTube URL から動画IDを抽出する関数
export function extractVideoId(input: string): string {
  // 既に動画IDの場合
  if (VideoIdSchema.safeParse(input).success) {
    return input;
  }

  // YouTube URL パターン
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

  throw new ValidationError('有効なYouTube URLまたは動画IDを指定してください', {
    input,
    examples: [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'dQw4w9WgXcQ',
    ],
  });
}

// 動画情報取得リクエストの検証
export const GetVideoInfoRequestSchema = z.object({
  video_id: z.string().transform(extractVideoId),
});

// 字幕一覧取得リクエストの検証
export const GetCaptionsListRequestSchema = z.object({
  video_id: z.string().transform(extractVideoId),
});

// 字幕ダウンロードリクエストの検証
export const DownloadCaptionsRequestSchema = z.object({
  video_id: z.string().transform(extractVideoId),
  lang: LanguageCodeSchema.optional().default('ja'),
  format: FormatSchema.optional().default('raw'),
});

// 動画検索リクエストの検証
export const SearchVideosRequestSchema = z.object({
  query: z.string().min(1, '検索クエリを入力してください'),
  lang: LanguageCodeSchema.optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

// 汎用的な検証関数
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
        '入力パラメータが無効です',
        { errors: details }
      );
    }
    throw error;
  }
}

// 言語コードの正規化
export function normalizeLanguageCode(lang: string): string {
  // 一般的な言語コードの正規化
  const normalized = lang.toLowerCase().replace('_', '-');
  
  // 一般的な変換
  const mappings: Record<string, string> = {
    'jp': 'ja',
    'japanese': 'ja',
    'english': 'en',
    'en-us': 'en',
    'en-gb': 'en',
  };

  return mappings[normalized] || normalized;
}

// 安全な文字列のサニタイズ
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTMLタグの除去
    .replace(/[\x00-\x1f\x7f]/g, '') // 制御文字の除去
    .trim();
}

// 数値の範囲チェック
export function validateRange(
  value: number,
  min: number,
  max: number,
  name: string
): number {
  if (value < min || value > max) {
    throw new ValidationError(
      `${name}は${min}から${max}の範囲で指定してください`,
      { value, min, max }
    );
  }
  return value;
}
