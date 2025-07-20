import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { EspoCRMConfig } from "../types.js";
import { EspoCRMResponse, WhereClause } from "./types.js";
import { MCPErrorHandler } from "../utils/errors.js";
import logger from "../utils/logger.js";

export class EspoCRMClient {
  private client: AxiosInstance;
  
  constructor(private config: EspoCRMConfig) {
    this.client = axios.create({
      baseURL: `${config.baseUrl.replace(/\/$/, '')}/api/v1/`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      if (this.config.authMethod === 'apikey') {
        config.headers['X-Api-Key'] = this.config.apiKey;
        logger.debug('Using API key authentication');
      } else if (this.config.authMethod === 'hmac' && this.config.secretKey) {
        const method = config.method?.toUpperCase() || 'GET';
        const uri = config.url || '';
        const body = config.data ? JSON.stringify(config.data) : '';
        const stringToSign = `${method} /${uri}${body}`;
        
        const hmac = crypto
          .createHmac('sha256', this.config.secretKey)
          .update(stringToSign)
          .digest('hex');
          
        config.headers['X-Hmac-Authorization'] = 
          Buffer.from(`${this.config.apiKey}:${hmac}`).toString('base64');
        logger.debug('Using HMAC authentication');
      }
      
      logger.debug(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
      return config;
    });
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Successful response from ${response.config.url}`, {
          status: response.status,
          dataLength: JSON.stringify(response.data).length
        });
        return response;
      },
      (error) => {
        logger.error('Request failed', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }
  
  async get<T = any>(entity: string, params?: any): Promise<EspoCRMResponse<T>> {
    try {
      const response = await this.client.get(entity, { params });
      return response.data;
    } catch (error) {
      MCPErrorHandler.handleError(error, `GET ${entity}`);
    }
  }
  
  async post<T = any>(entity: string, data: any): Promise<T> {
    try {
      const response = await this.client.post(entity, data);
      logger.info(`Created ${entity}`, { id: response.data.id });
      return response.data;
    } catch (error) {
      MCPErrorHandler.handleError(error, `POST ${entity}`);
    }
  }
  
  async put<T = any>(entity: string, id: string, data: any): Promise<T> {
    try {
      const response = await this.client.put(`${entity}/${id}`, data);
      logger.info(`Updated ${entity}`, { id });
      return response.data;
    } catch (error) {
      MCPErrorHandler.handleError(error, `PUT ${entity}/${id}`);
    }
  }
  
  async patch<T = any>(entity: string, id: string, data: any): Promise<T> {
    try {
      const response = await this.client.patch(`${entity}/${id}`, data);
      logger.info(`Patched ${entity}`, { id });
      return response.data;
    } catch (error) {
      MCPErrorHandler.handleError(error, `PATCH ${entity}/${id}`);
    }
  }
  
  async delete(entity: string, id: string): Promise<boolean> {
    try {
      await this.client.delete(`${entity}/${id}`);
      logger.info(`Deleted ${entity}`, { id });
      return true;
    } catch (error) {
      MCPErrorHandler.handleError(error, `DELETE ${entity}/${id}`);
    }
  }
  
  async getById<T = any>(entity: string, id: string, select?: string[]): Promise<T> {
    try {
      const params = select ? { select: select.join(',') } : {};
      const response = await this.client.get(`${entity}/${id}`, { params });
      return response.data;
    } catch (error) {
      MCPErrorHandler.handleError(error, `GET ${entity}/${id}`);
    }
  }
  
  async getRelated<T = any>(entity: string, id: string, link: string, params?: any): Promise<EspoCRMResponse<T>> {
    try {
      const response = await this.client.get(`${entity}/${id}/${link}`, { params });
      return response.data;
    } catch (error) {
      MCPErrorHandler.handleError(error, `GET ${entity}/${id}/${link}`);
    }
  }
  
  async linkRecords(entity: string, id: string, link: string, foreignIds: string | string[]): Promise<boolean> {
    try {
      const ids = Array.isArray(foreignIds) ? foreignIds : [foreignIds];
      for (const foreignId of ids) {
        await this.client.post(`${entity}/${id}/${link}`, { id: foreignId });
      }
      logger.info(`Linked ${entity}/${id} to ${link}`, { foreignIds });
      return true;
    } catch (error) {
      MCPErrorHandler.handleError(error, `LINK ${entity}/${id}/${link}`);
    }
  }
  
  async unlinkRecords(entity: string, id: string, link: string, foreignIds: string | string[]): Promise<boolean> {
    try {
      const ids = Array.isArray(foreignIds) ? foreignIds : [foreignIds];
      for (const foreignId of ids) {
        await this.client.delete(`${entity}/${id}/${link}`, { data: { id: foreignId } });
      }
      logger.info(`Unlinked ${entity}/${id} from ${link}`, { foreignIds });
      return true;
    } catch (error) {
      MCPErrorHandler.handleError(error, `UNLINK ${entity}/${id}/${link}`);
    }
  }
  
  async search<T = any>(entity: string, searchParams: {
    where?: WhereClause[];
    select?: string[];
    orderBy?: string;
    order?: 'asc' | 'desc';
    maxSize?: number;
    offset?: number;
  }): Promise<EspoCRMResponse<T>> {
    try {
      const params: any = {};
      
      if (searchParams.where) {
        params.where = JSON.stringify(searchParams.where);
      }
      if (searchParams.select) {
        params.select = searchParams.select.join(',');
      }
      if (searchParams.orderBy) {
        params.orderBy = searchParams.orderBy;
        params.order = searchParams.order || 'asc';
      }
      if (searchParams.maxSize) {
        params.maxSize = searchParams.maxSize;
      }
      if (searchParams.offset) {
        params.offset = searchParams.offset;
      }
      
      return await this.get<T>(entity, params);
    } catch (error) {
      MCPErrorHandler.handleError(error, `SEARCH ${entity}`);
    }
  }
  
  async testConnection(): Promise<{ success: boolean; user?: any; version?: string }> {
    try {
      const userResponse = await this.client.get('App/user');
      const appResponse = await this.client.get('App');
      
      return {
        success: true,
        user: userResponse.data,
        version: appResponse.data.version
      };
    } catch (error: any) {
      logger.error('Connection test failed', { error: error.message });
      return { success: false };
    }
  }

  
  // Helper method to build where clauses
  static buildWhereClause(filters: Record<string, any>): WhereClause[] {
    const where: WhereClause[] = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('*')) {
          // Wildcard search
          where.push({
            type: 'contains',
            attribute: key,
            value: value.replace(/\*/g, '')
          });
        } else if (Array.isArray(value)) {
          // Array values use 'in' operator
          where.push({
            type: 'in',
            attribute: key,
            value: value
          });
        } else {
          // Exact match
          where.push({
            type: 'equals',
            attribute: key,
            value: value
          });
        }
      }
    });
    
    return where;
  }
}