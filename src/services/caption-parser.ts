import type { CaptionSegment, CaptionsData } from '../types/youtube.js';
import { formatToSRT, formatToVTT } from '../utils/formatters.js';

export class CaptionParser {
  // Apply format conversion to caption data
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
        // No format conversion for raw format
        formattedContent = undefined;
        break;
    }

    return {
      ...captionsData,
      formattedContent,
    };
  }

  // Merge caption segments (combine segments with short intervals)
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

      // Merge if gap is small
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

  // Filter caption segments (remove segments that are too short)
  static filterSegments(
    segments: CaptionSegment[],
    minDuration: number = 0.5
  ): CaptionSegment[] {
    return segments.filter(segment => 
      segment.duration >= minDuration && 
      segment.text.trim().length > 0
    );
  }

  // Normalize caption text
  static normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  // Adjust timing of caption segments
  static adjustTiming(
    segments: CaptionSegment[],
    offset: number = 0
  ): CaptionSegment[] {
    return segments.map(segment => ({
      ...segment,
      start: Math.max(0, segment.start + offset),
    }));
  }

  // Get statistics for captions
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

  // Extract specific time range from captions
  static extractTimeRange(
    segments: CaptionSegment[],
    startTime: number,
    endTime: number
  ): CaptionSegment[] {
    return segments.filter(segment => {
      const segmentEnd = segment.start + segment.duration;
      return segment.start < endTime && segmentEnd > startTime;
    }).map(segment => {
      // Adjust segment to fit time range
      const segmentEnd = segment.start + segment.duration;
      const newStart = Math.max(segment.start, startTime);
      const newEnd = Math.min(segmentEnd, endTime);
      
      return {
        ...segment,
        start: newStart - startTime, // Convert to relative time
        duration: newEnd - newStart,
      };
    });
  }

  // Search text in captions
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

  // Validate caption quality
  static validateCaptions(segments: CaptionSegment[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Basic validation
    if (segments.length === 0) {
      issues.push('No caption segments exist');
    }

    // Time consistency check
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      
      if (segment.start < 0) {
        issues.push(`Segment ${i + 1}: Start time is negative`);
      }
      
      if (segment.duration <= 0) {
        issues.push(`Segment ${i + 1}: Duration is zero or negative`);
      }
      
      if (!segment.text.trim()) {
        issues.push(`Segment ${i + 1}: Text is empty`);
      }

      // Check overlap with previous segment
      if (i > 0) {
        const prevSegment = segments[i - 1]!;
        const prevEnd = prevSegment.start + prevSegment.duration;
        
        if (segment.start < prevEnd) {
          issues.push(`Segment ${i + 1}: Overlaps with previous segment`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
