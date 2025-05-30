import type { CaptionSegment, CaptionsData } from '../types/youtube.js';
import { formatToSRT, formatToVTT } from '../utils/formatters.js';

export class CaptionParser {
  // 字幕データにフォーマット変換を適用
  static formatCaptions(captionsData: CaptionsData): CaptionsData {
    const { format, segments } = captionsData;

    let formattedContent: string | undefined;

    switch (format) {
      case 'srt':
        formattedContent = formatToSRT(segments);
        break;
      case 'vtt':
        formattedContent = formatToVTT(segments);
        break;
      case 'raw':
      default:
        // Raw形式の場合はフォーマット変換なし
        formattedContent = undefined;
        break;
    }

    return {
      ...captionsData,
      formattedContent,
    };
  }

  // 字幕セグメントをマージ（短い間隔のセグメントを結合）
  static mergeSegments(
    segments: CaptionSegment[],
    maxGap: number = 1.0
  ): CaptionSegment[] {
    if (segments.length === 0) return segments;

    const merged: CaptionSegment[] = [];
    let current = { ...segments[0]! };

    for (let i = 1; i < segments.length; i++) {
      const next = segments[i]!;
      const currentEnd = current.start + current.duration;
      const gap = next.start - currentEnd;

      // ギャップが小さい場合はマージ
      if (gap <= maxGap) {
        current.duration = next.start + next.duration - current.start;
        current.text += ' ' + next.text;
      } else {
        merged.push(current);
        current = { ...next };
      }
    }

    merged.push(current);
    return merged;
  }

  // 字幕セグメントをフィルタリング（短すぎるセグメントを除去）
  static filterSegments(
    segments: CaptionSegment[],
    minDuration: number = 0.5
  ): CaptionSegment[] {
    return segments.filter(segment => 
      segment.duration >= minDuration && 
      segment.text.trim().length > 0
    );
  }

  // 字幕テキストの正規化
  static normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // 複数の空白を単一に
      .replace(/\n+/g, '\n') // 複数の改行を単一に
      .trim();
  }

  // 字幕セグメントの時間調整
  static adjustTiming(
    segments: CaptionSegment[],
    offset: number = 0
  ): CaptionSegment[] {
    return segments.map(segment => ({
      ...segment,
      start: Math.max(0, segment.start + offset),
    }));
  }

  // 字幕の統計情報を取得
  static getStatistics(segments: CaptionSegment[]) {
    if (segments.length === 0) {
      return {
        totalSegments: 0,
        totalDuration: 0,
        totalWords: 0,
        averageSegmentDuration: 0,
        averageWordsPerSegment: 0,
      };
    }

    const totalDuration = segments.reduce((sum, segment) => 
      sum + segment.duration, 0
    );

    const totalWords = segments.reduce((sum, segment) => 
      sum + segment.text.split(/\s+/).length, 0
    );

    return {
      totalSegments: segments.length,
      totalDuration,
      totalWords,
      averageSegmentDuration: totalDuration / segments.length,
      averageWordsPerSegment: totalWords / segments.length,
    };
  }

  // 字幕から特定の時間範囲を抽出
  static extractTimeRange(
    segments: CaptionSegment[],
    startTime: number,
    endTime: number
  ): CaptionSegment[] {
    return segments.filter(segment => {
      const segmentEnd = segment.start + segment.duration;
      return segment.start < endTime && segmentEnd > startTime;
    }).map(segment => {
      // 時間範囲に合わせてセグメントを調整
      const segmentEnd = segment.start + segment.duration;
      const newStart = Math.max(segment.start, startTime);
      const newEnd = Math.min(segmentEnd, endTime);
      
      return {
        ...segment,
        start: newStart - startTime, // 相対時間に変換
        duration: newEnd - newStart,
      };
    });
  }

  // 字幕テキストの検索
  static searchText(
    segments: CaptionSegment[],
    query: string,
    caseSensitive: boolean = false
  ): Array<CaptionSegment & { matchIndex: number }> {
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    
    return segments
      .map((segment, index) => {
        const text = caseSensitive ? segment.text : segment.text.toLowerCase();
        const matchIndex = text.indexOf(searchQuery);
        
        return matchIndex >= 0 ? { ...segment, matchIndex: index } : null;
      })
      .filter((result): result is CaptionSegment & { matchIndex: number } => 
        result !== null
      );
  }

  // 字幕の品質チェック
  static validateCaptions(segments: CaptionSegment[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // 基本的な検証
    if (segments.length === 0) {
      issues.push('字幕セグメントが存在しません');
    }

    // 時間の整合性チェック
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      
      if (segment.start < 0) {
        issues.push(`セグメント ${i + 1}: 開始時間が負の値です`);
      }
      
      if (segment.duration <= 0) {
        issues.push(`セグメント ${i + 1}: 継続時間が0以下です`);
      }
      
      if (!segment.text.trim()) {
        issues.push(`セグメント ${i + 1}: テキストが空です`);
      }

      // 前のセグメントとの重複チェック
      if (i > 0) {
        const prevSegment = segments[i - 1]!;
        const prevEnd = prevSegment.start + prevSegment.duration;
        
        if (segment.start < prevEnd) {
          issues.push(`セグメント ${i + 1}: 前のセグメントと重複しています`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
