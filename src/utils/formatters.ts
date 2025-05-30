import type { CaptionSegment } from '../types/youtube.js';

// 時間を秒からSRT形式の時間文字列に変換
export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds
    .toString()
    .padStart(3, '0')}`;
}

// 時間を秒からVTT形式の時間文字列に変換
export function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds
    .toString()
    .padStart(3, '0')}`;
}

// 字幕セグメントをSRT形式に変換
export function formatToSRT(segments: CaptionSegment[]): string {
  return segments
    .map((segment, index) => {
      const startTime = formatSRTTime(segment.start);
      const endTime = formatSRTTime(segment.start + segment.duration);
      const text = segment.text.replace(/\n/g, '\n');

      return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`;
    })
    .join('\n');
}

// 字幕セグメントをVTT形式に変換
export function formatToVTT(segments: CaptionSegment[]): string {
  const header = 'WEBVTT\n\n';
  const content = segments
    .map(segment => {
      const startTime = formatVTTTime(segment.start);
      const endTime = formatVTTTime(segment.start + segment.duration);
      const text = segment.text.replace(/\n/g, '\n');

      return `${startTime} --> ${endTime}\n${text}\n`;
    })
    .join('\n');

  return header + content;
}

// 再生時間を人間が読みやすい形式に変換
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// 数値を人間が読みやすい形式に変換（再生回数など）
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 日付を人間が読みやすい形式に変換
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// テキストを指定した長さで切り詰める
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

// HTMLエンティティをデコード
export function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  return text.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
}

// 字幕テキストのクリーンアップ
export function cleanCaptionText(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/\[.*?\]/g, '') // [音楽] などの注釈を除去
    .replace(/\(.*?\)/g, '') // (笑い) などの注釈を除去
    .replace(/\s+/g, ' ') // 複数の空白を単一の空白に
    .trim();
}

// ファイル名として安全な文字列に変換
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // 無効な文字を置換
    .replace(/\s+/g, '_') // 空白をアンダースコアに
    .replace(/_{2,}/g, '_') // 連続するアンダースコアを単一に
    .replace(/^_|_$/g, '') // 先頭・末尾のアンダースコアを除去
    .substring(0, 100); // 長さ制限
}

// バイト数を人間が読みやすい形式に変換
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
