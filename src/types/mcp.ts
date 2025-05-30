export interface MCPError {
  type: string;
  message: string;
  details?: Record<string, any>;
  suggestion?: string;
}

export interface MCPErrorResponse {
  error: MCPError;
}

export interface GetVideoInfoRequest {
  video_id: string;
}

export interface GetCaptionsListRequest {
  video_id: string;
}

export interface DownloadCaptionsRequest {
  video_id: string;
  lang?: string;
  format?: 'raw' | 'srt' | 'vtt';
}

export interface SearchVideosRequest {
  query: string;
  lang?: string;
  limit?: number;
}

export type MCPToolRequest = 
  | GetVideoInfoRequest
  | GetCaptionsListRequest
  | DownloadCaptionsRequest
  | SearchVideosRequest;

export interface MCPToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: MCPError;
}
