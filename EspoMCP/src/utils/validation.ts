import { z } from "zod";

// Common validation schemas
export const EmailSchema = z.string().email("Invalid email address");
export const PhoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format");
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
export const DateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "DateTime must be in YYYY-MM-DD HH:MM:SS format");
export const UrlSchema = z.string().url("Invalid URL format");
export const IdSchema = z.string().min(1, "ID cannot be empty");

// Name validation (allows letters, spaces, hyphens, apostrophes)
export const NameSchema = z.string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s'\-\.]+$/, "Name contains invalid characters");

// Sanitization functions
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

export function validateEntityId(id: string, entityType: string): void {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new Error(`Invalid ${entityType} ID: ID cannot be empty`);
  }
  
  if (id.length > 50) {
    throw new Error(`Invalid ${entityType} ID: ID too long`);
  }
  
  // Basic format validation for EspoCRM IDs
  if (!/^[a-zA-Z0-9]+$/.test(id)) {
    throw new Error(`Invalid ${entityType} ID: ID contains invalid characters`);
  }
}

export function validateDateRange(startDate?: string, endDate?: string): void {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error("Start date cannot be after end date");
    }
  }
}

export function validateAmount(amount: number): void {
  if (amount < 0) {
    throw new Error("Amount cannot be negative");
  }
  
  if (amount > 999999999.99) {
    throw new Error("Amount exceeds maximum allowed value");
  }
}

export function validateProbability(probability: number): void {
  if (probability < 0 || probability > 100) {
    throw new Error("Probability must be between 0 and 100");
  }
}