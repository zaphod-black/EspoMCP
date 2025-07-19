import { MCPError } from "../types.js";

export class MCPErrorHandler {
  static handleError(error: any, context: string): never {
    // Network/Connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(`EspoCRM server unavailable: ${context}. Check ESPOCRM_URL configuration.`);
    }
    
    if (error.code === 'ETIMEDOUT') {
      throw new Error(`Request timeout: ${context}. Server may be overloaded.`);
    }
    
    // HTTP errors
    if (error.response?.status) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          throw new Error('Authentication failed - check API key configuration and user permissions');
        case 403:
          throw new Error(`Access forbidden - insufficient permissions for ${context}`);
        case 404:
          throw new Error(`Resource not found: ${context}. Check entity ID and permissions.`);
        case 400:
          const message = data?.message || 'Invalid request data';
          throw new Error(`Bad request in ${context}: ${message}`);
        case 422:
          const validationErrors = data?.data || {};
          const errorMessages = Object.entries(validationErrors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          throw new Error(`Validation errors in ${context}: ${errorMessages}`);
        case 429:
          throw new Error('Rate limit exceeded - please wait before making more requests');
        case 500:
          throw new Error(`EspoCRM server error: ${context}. Contact system administrator.`);
        default:
          throw new Error(`HTTP ${status} error in ${context}: ${data?.message || 'Unknown error'}`);
      }
    }
    
    // Application-level errors
    if (error.message) {
      throw new Error(`Error in ${context}: ${error.message}`);
    }
    
    // Fallback
    throw new Error(`Unexpected error in ${context}: ${String(error)}`);
  }
  
  static createMCPError(code: string, message: string, context?: string): MCPError {
    return { code, message, context };
  }
  
  static isNetworkError(error: any): boolean {
    return ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code);
  }
  
  static isAuthError(error: any): boolean {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  
  static isValidationError(error: any): boolean {
    return error.response?.status === 400 || error.response?.status === 422;
  }
}