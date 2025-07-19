export interface EspoCRMConfig {
  baseUrl: string;
  apiKey: string;
  authMethod: 'apikey' | 'hmac';
  secretKey?: string;
}

export interface ServerConfig {
  rateLimit: number;
  timeout: number;
  logLevel: string;
}

export interface Config {
  espocrm: EspoCRMConfig;
  server: ServerConfig;
}

export interface MCPError {
  code: string;
  message: string;
  context?: string;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
  limit: number;
}