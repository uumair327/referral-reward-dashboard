import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  ModelValidation,
  ValidationError,
  FormValidationResult,
  ReferralOffer,
  CreateReferralOfferRequest,
  Category,
  CreateCategoryRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {}

  /**
   * Validate URL format and accessibility
   */
  validateUrl(url: string): Observable<{ isValid: boolean; error?: string }> {
    if (!url || url.trim().length === 0) {
      return of({ isValid: false, error: 'URL is required' });
    }

    if (!ModelValidation.isValidUrl(url)) {
      return of({ isValid: false, error: 'Please enter a valid URL (http:// or https://)' });
    }

    // In a real application, you might want to check if the URL is accessible
    // For now, we'll just validate the format
    return of({ isValid: true });
  }

  /**
   * Check URL accessibility (basic check)
   */
  async checkUrlAccessibility(url: string): Promise<{ isAccessible: boolean; status?: number; error?: string }> {
    try {
      // Note: This won't work in browser due to CORS restrictions
      // In a real application, this would be done on the server side
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // This limits what we can check
      });
      
      return { 
        isAccessible: true,
        status: response.status 
      };
    } catch (error) {
      return { 
        isAccessible: false, 
        error: 'Unable to verify URL accessibility' 
      };
    }
  }

  /**
   * Validate referral code format and uniqueness
   */
  validateReferralCode(
    code: string, 
    categoryId: string, 
    existingCodes: string[] = []
  ): FormValidationResult {
    const errors: ValidationError[] = [];

    if (!code || code.trim().length === 0) {
      // Referral code is optional
      return { isValid: true, errors: [] };
    }

    if (!ModelValidation.isValidReferralCode(code)) {
      errors.push({
        field: 'referralCode',
        message: 'Referral code can only contain letters, numbers, hyphens, and underscores'
      });
    }

    if (code.length > 50) {
      errors.push({
        field: 'referralCode',
        message: 'Referral code must be less than 50 characters'
      });
    }

    if (existingCodes.includes(code.toLowerCase())) {
      errors.push({
        field: 'referralCode',
        message: 'This referral code already exists in this category'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate referral offer data
   */
  validateReferralOffer(offer: Partial<ReferralOffer>): FormValidationResult {
    return ModelValidation.validateReferralOffer(offer);
  }

  /**
   * Validate create referral offer request
   */
  validateCreateReferralOfferRequest(request: CreateReferralOfferRequest): FormValidationResult {
    return ModelValidation.validateCreateReferralOfferRequest(request);
  }

  /**
   * Validate category data
   */
  validateCategory(category: Partial<Category>): FormValidationResult {
    return ModelValidation.validateCategory(category);
  }

  /**
   * Validate create category request
   */
  validateCreateCategoryRequest(request: CreateCategoryRequest): FormValidationResult {
    return ModelValidation.validateCreateCategoryRequest(request);
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email is required' };
    }

    if (!ModelValidation.isValidEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
  }

  /**
   * Validate form fields with custom rules
   */
  validateFormField(
    fieldName: string, 
    value: any, 
    rules: ValidationRule[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors.push({
          field: fieldName,
          message: result.message || `${fieldName} is invalid`
        });
      }
    }

    return errors;
  }

  /**
   * Validate multiple fields at once
   */
  validateMultipleFields(
    data: { [key: string]: any },
    fieldRules: { [fieldName: string]: ValidationRule[] }
  ): FormValidationResult {
    const allErrors: ValidationError[] = [];

    Object.keys(fieldRules).forEach(fieldName => {
      const fieldValue = data[fieldName];
      const rules = fieldRules[fieldName];
      const fieldErrors = this.validateFormField(fieldName, fieldValue, rules);
      allErrors.push(...fieldErrors);
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string): string {
    return ModelValidation.sanitizeHtml(html);
  }

  /**
   * Validate file upload
   */
  validateFileUpload(
    file: File, 
    options: FileValidationOptions
  ): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'File is required' };
    }

    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
      return { 
        isValid: false, 
        error: `File size must be less than ${maxSizeMB}MB` 
      };
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}` 
      };
    }

    // Check file extension
    if (options.allowedExtensions) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !options.allowedExtensions.includes(fileExtension)) {
        return { 
          isValid: false, 
          error: `File extension not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}` 
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Create common validation rules
   */
  static createValidationRules() {
    return {
      required: (message?: string): ValidationRule => ({
        validator: (value: any) => ({
          isValid: value !== null && value !== undefined && 
                   (typeof value !== 'string' || value.trim().length > 0),
          message: message || 'This field is required'
        })
      }),

      minLength: (min: number, message?: string): ValidationRule => ({
        validator: (value: string) => ({
          isValid: !value || value.length >= min,
          message: message || `Must be at least ${min} characters`
        })
      }),

      maxLength: (max: number, message?: string): ValidationRule => ({
        validator: (value: string) => ({
          isValid: !value || value.length <= max,
          message: message || `Must be no more than ${max} characters`
        })
      }),

      email: (message?: string): ValidationRule => ({
        validator: (value: string) => ({
          isValid: !value || ModelValidation.isValidEmail(value),
          message: message || 'Please enter a valid email address'
        })
      }),

      url: (message?: string): ValidationRule => ({
        validator: (value: string) => ({
          isValid: !value || ModelValidation.isValidUrl(value),
          message: message || 'Please enter a valid URL'
        })
      }),

      pattern: (regex: RegExp, message?: string): ValidationRule => ({
        validator: (value: string) => ({
          isValid: !value || regex.test(value),
          message: message || 'Invalid format'
        })
      }),

      custom: (validatorFn: (value: any) => boolean, message: string): ValidationRule => ({
        validator: (value: any) => ({
          isValid: validatorFn(value),
          message
        })
      })
    };
  }
}

// Supporting interfaces
export interface ValidationRule {
  validator: (value: any) => { isValid: boolean; message?: string };
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[]; // file extensions without dot
}