this is vibe coded BE CAREFUL


# YouTube Caption MCP Server
Vive
An MCP server for Cursor to retrieve YouTube video captions. Access YouTube video caption information without requiring an API key.

## Features

- **No API Key Required**: Access YouTube's internal API using the youtube-js library
- **Multilingual Support**: Automatic detection and retrieval of available caption languages
- **Format Conversion**: Caption output in Raw, SRT, and VTT formats
- **Caching**: In-memory caching for improved performance
- **Claude Integration**: Seamless integration via MCP protocol

## Installation

### Install from NPM

```bash
npm install -g @iamyosuke/youtube-caption-mcp
```

### Build from Source

```bash
git clone https://github.com/iamyosuke/youtube-caption-mcp.git
cd youtube-caption-mcp
npm install
npm run build
```


### Cursor Configuration

Add the following to your Cursor configuration file (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "youtube-caption-mcp": {
      "command": "npx",
      "args": ["-y", "youtube-caption-mcp", "--stdio"],
      "env": {
        "CACHE_ENABLED": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```



## Available Tools

### 1. get_video_info

Retrieves basic information about a YouTube video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 2. get_captions_list

Retrieves a list of available captions for a video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 3. download_captions

Downloads captions for a specified video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL
- `lang` (required): Caption language code (e.g., "ja", "en")
- `format` (optional): Output format - "raw", "srt", "vtt" (default: "raw")

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "lang": "en",
  "format": "srt"
}
```

### 4. search_videos_with_captions

Searches for videos with captions.

**Parameters:**
- `query` (required): Search query
- `lang` (optional): Caption language filter
- `limit` (optional): Maximum number of search results (1-50, default: 10)

**Example:**
```json
{
  "query": "programming tutorial",
  "lang": "en",
  "limit": 5
}
```

## Supported URL Formats

The following YouTube URL formats are supported:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (11-character video ID)

## Environment Variables

| Variable Name | Default Value | Description |
|---------------|---------------|-------------|
| `CACHE_ENABLED` | `true` | Enable/disable caching |
| `CACHE_DEFAULT_TTL` | `3600` | Default cache retention time (seconds) |
| `CACHE_MAX_KEYS` | `1000` | Maximum number of cache keys |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |

## Development

### Setup Development Environment

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Lint & Format

```bash
npm run lint
npm run format
```

## License

MIT License

## Contributions

Pull requests and issue reports are welcome.

## Disclaimer

**Note**: This project was vibe coded for three hours on a weekend and hasn't been thoroughly tested. Use in production environments at your own risk.

## Caution

- Please use this tool in accordance with YouTube's Terms of Service
- Handle copyrighted content appropriately
- Be mindful of rate limits when sending many requests

## Troubleshooting

### Common Issues

1. **Video Not Found**
   - Check if the video ID or URL is correct
   - Check if the video is publicly available

2. **Cannot Get Captions**
   - Check if the video has captions
   - Check if the specified language captions are available

3. **Slow Performance**
   - Check if caching is enabled
   - Check your network connection

### Checking Logs

To view detailed logs, set the environment variable `LOG_LEVEL=debug`:

```bash
LOG_LEVEL=debug npx @iamyosuke/youtube-caption-mcp
```

---

# YouTube Caption MCP Server (Japanese)

A YouTube video caption retrieval MCP server for Cursor. Access YouTube video caption information without requiring an API key.

## Features

- **No API Key Required**: Access YouTube's internal API using the youtube-js library
- **Multilingual Support**: Automatic detection and retrieval of available caption languages
- **Format Conversion**: Caption output in Raw, SRT, and VTT formats
- **Caching**: In-memory caching for improved performance
- **Claude Integration**: Seamless integration via MCP protocol

## Installation

### Install from NPM

```bash
npm install -g @iamyosuke/youtube-caption-mcp
```

### Build from Source

```bash
git clone https://github.com/iamyosuke/youtube-caption-mcp.git
cd youtube-caption-mcp
npm install
npm run build
```


### Cursor Configuration

Add the following to your Cursor configuration file (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "youtube-caption-mcp": {
      "command": "npx",
      "args": ["-y", "youtube-caption-mcp", "--stdio"],
      "env": {
        "CACHE_ENABLED": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```



## Available Tools

### 1. get_video_info

Get basic information about a YouTube video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 2. get_captions_list

Get list of available captions for a video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 3. download_captions

Download captions for the specified video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL
- `lang` (required): Caption language code (e.g., "ja", "en")
- `format` (optional): Output format - "raw", "srt", "vtt" (default: "raw")

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "lang": "en",
  "format": "srt"
}
```

### 4. search_videos_with_captions

Search for videos with captions.

**Parameters:**
- `query` (required): Search query
- `lang` (optional): Caption language filter
- `limit` (optional): Maximum number of search results (1-50, default: 10)

**Example:**
```json
{
  "query": "programming tutorial",
  "lang": "en",
  "limit": 5
}
```

## Supported URL Formats

The following YouTube URL formats are supported:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (11-character video ID)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_ENABLED` | `true` | Enable/disable caching |
| `CACHE_DEFAULT_TTL` | `3600` | Default cache retention time (seconds) |
| `CACHE_MAX_KEYS` | `1000` | Maximum number of cache keys |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |

## Development

### Development Environment Setup

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Lint and Format

```bash
npm run lint
npm run format
```

## License

MIT License

## Contributing

Pull requests and issue reports are welcome.

## Disclaimer

**Note**: This project was created in 3 hours over a weekend and has not been thoroughly tested. Use in production at your own risk.

## Notes

- Please use this tool in accordance with YouTube's Terms of Service
- Please be careful with proper handling of copyrighted content
- Please be careful with rate limits when sending large numbers of requests

## Troubleshooting

### Common Issues

1. **Video not found**
   - Check if the video ID or URL is correct
   - Check if the video is publicly available

2. **Cannot get captions**
   - Check if captions exist for the video
   - Check if captions in the specified language are available

3. **Slow performance**
   - Check if caching is enabled
   - Check your network connection

### Checking Logs

To view detailed logs, set the environment variable `LOG_LEVEL=debug`:

```bash
LOG_LEVEL=debug npx @iamyosuke/youtube-caption-mcp
