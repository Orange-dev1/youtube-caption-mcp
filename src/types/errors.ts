export class MCPError extends Error {
  public readonly type: string;
  public readonly details?: Record<string, any>;
  public readonly suggestion?: string;

  constructor(
    type: string,
    message: string,
    details?: Record<string, any>,
    suggestion?: string
  ) {
    super(message);
    this.name = 'MCPError';
    this.type = type;
    this.details = details;
    this.suggestion = suggestion;
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      ...(this.details && { details: this.details }),
      ...(this.suggestion && { suggestion: this.suggestion }),
    };
  }
}

export class ValidationError extends MCPError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, details, '入力パラメータを確認してください');
  }
}

export class YouTubeError extends MCPError {
  constructor(
    type: string,
    message: string,
    details?: Record<string, any>,
    suggestion?: string
  ) {
    super(type, message, details, suggestion);
  }
}

export class VideoNotFoundError extends YouTubeError {
  constructor(videoId: string) {
    super(
      'VIDEO_NOT_FOUND',
      '指定された動画が見つかりません',
      { videoId },
      '動画IDまたはURLを確認してください'
    );
  }
}

export class CaptionsNotAvailableError extends YouTubeError {
  constructor(videoId: string, language?: string, customMessage?: string) {
    super(
      'CAPTIONS_NOT_AVAILABLE',
      customMessage || '指定された動画に字幕が存在しません',
      { videoId, language },
      '他の言語の字幕が利用可能か確認してください'
    );
  }
}

export class AccessDeniedError extends YouTubeError {
  constructor(videoId: string) {
    super(
      'ACCESS_DENIED',
      '動画にアクセスできません（非公開または削除済み）',
      { videoId },
      '動画が公開されているか確認してください'
    );
  }
}

export class CacheError extends MCPError {
  constructor(message: string, details?: Record<string, any>) {
    super('CACHE_ERROR', message, details, 'キャッシュをクリアして再試行してください');
  }
}

export class SystemError extends MCPError {
  constructor(message: string, details?: Record<string, any>) {
    super('SYSTEM_ERROR', message, details, 'しばらく時間をおいて再試行してください');
  }
}

export class NetworkError extends YouTubeError {
  constructor(message: string, details?: Record<string, any>) {
    super(
      'NETWORK_ERROR',
      message,
      details,
      'ネットワーク接続を確認してください'
    );
  }
}

export class RateLimitError extends YouTubeError {
  constructor() {
    super(
      'RATE_LIMIT_EXCEEDED',
      'リクエスト制限に達しました',
      {},
      'しばらく時間をおいて再試行してください'
    );
  }
}
