import { 
  ReferralOffer, 
  CreateReferralOfferRequest, 
  Category, 
  CreateCategoryRequest,
  ValidationError,
  FormValidationResult 
} from './index';

export class ModelValidation {
  
  /**
   * Validates a referral offer object
   */
  static validateReferralOffer(offer: Partial<ReferralOffer>): FormValidationResult {
    const errors: ValidationError[] = [];

    if (!offer.title || offer.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (offer.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must be less than 100 characters' });
    }

    if (!offer.description || offer.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description is required' });
    } else if (offer.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
    }

    if (!offer.referralLink || offer.referralLink.trim().length === 0) {
      errors.push({ field: 'referralLink', message: 'Referral link is required' });
    } else if (!this.isValidUrl(offer.referralLink)) {
      errors.push({ field: 'referralLink', message: 'Please enter a valid URL' });
    }

    if (!offer.categoryId || offer.categoryId.trim().length === 0) {
      errors.push({ field: 'categoryId', message: 'Category is required' });
    }

    if (offer.referralCode && offer.referralCode.length > 50) {
      errors.push({ field: 'referralCode', message: 'Referral code must be less than 50 characters' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a create referral offer request
   */
  static validateCreateReferralOfferRequest(request: CreateReferralOfferRequest): FormValidationResult {
    return this.validateReferralOffer(request);
  }

  /**
   * Validates a category object
   */
  static validateCategory(category: Partial<Category>): FormValidationResult {
    const errors: ValidationError[] = [];

    if (!category.name || category.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Category name is required' });
    } else if (category.name.length > 50) {
      errors.push({ field: 'name', message: 'Category name must be less than 50 characters' });
    }

    if (!category.icon || category.icon.trim().length === 0) {
      errors.push({ field: 'icon', message: 'Category icon is required' });
    }

    if (!category.description || category.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Category description is required' });
    } else if (category.description.length > 200) {
      errors.push({ field: 'description', message: 'Category description must be less than 200 characters' });
    }

    if (category.displayOrder !== undefined && (category.displayOrder < 0 || category.displayOrder > 100)) {
      errors.push({ field: 'displayOrder', message: 'Display order must be between 0 and 100' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a create category request
   */
  static validateCreateCategoryRequest(request: CreateCategoryRequest): FormValidationResult {
    return this.validateCategory(request);
  }

  /**
   * Validates if a string is a valid URL
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validates if a referral code has valid format
   */
  static isValidReferralCode(code: string): boolean {
    if (!code || code.trim().length === 0) {
      return true; // Optional field
    }
    
    // Allow alphanumeric characters, hyphens, and underscores
    const codeRegex = /^[a-zA-Z0-9_-]+$/;
    return codeRegex.test(code) && code.length <= 50;
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitizes HTML content to prevent XSS
   */
  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Validates that required fields are present
   */
  static validateRequiredFields<T>(obj: T, requiredFields: (keyof T)[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    requiredFields.forEach(field => {
      const value = obj[field];
      if (value === undefined || value === null || 
          (typeof value === 'string' && value.trim().length === 0)) {
        errors.push({ 
          field: String(field), 
          message: `${String(field)} is required` 
        });
      }
    });

    return errors;
  }
}