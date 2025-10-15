import { TestBed } from '@angular/core/testing';
import { ValidationService, ValidationRule, FileValidationOptions } from './validation.service';
import { ReferralOffer, CreateReferralOfferRequest, Category, CreateCategoryRequest } from '../models';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path?query=value',
        'http://subdomain.example.com:8080/path'
      ];

      validUrls.forEach(url => {
        service.validateUrl(url).subscribe(result => {
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
        });
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        '',
        '   ',
        'not-a-url',
        'ftp://example.com',
        'example.com',
        'www.example.com'
      ];

      invalidUrls.forEach(url => {
        service.validateUrl(url).subscribe(result => {
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
        });
      });
    });

    it('should handle null and undefined URLs', () => {
      service.validateUrl(null as any).subscribe(result => {
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('required');
      });

      service.validateUrl(undefined as any).subscribe(result => {
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('required');
      });
    });
  });

  describe('checkUrlAccessibility', () => {
    it('should handle URL accessibility check', async () => {
      // Note: This test is limited due to CORS restrictions in browser environment
      const result = await service.checkUrlAccessibility('https://example.com');
      
      // We can only test that the method returns a proper structure
      expect(result).toBeDefined();
      expect(typeof result.isAccessible).toBe('boolean');
    });

    it('should handle invalid URLs gracefully', async () => {
      const result = await service.checkUrlAccessibility('invalid-url');
      
      expect(result.isAccessible).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateReferralCode', () => {
    it('should validate correct referral codes', () => {
      const validCodes = [
        'ABC123',
        'test-code',
        'TEST_CODE',
        'code123',
        'A1B2C3'
      ];

      validCodes.forEach(code => {
        const result = service.validateReferralCode(code, 'cat1', []);
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
    });

    it('should reject invalid referral codes', () => {
      const invalidCodes = [
        'code with spaces',
        'code@special',
        'code#hash',
        'code!exclamation'
      ];

      invalidCodes.forEach(code => {
        const result = service.validateReferralCode(code, 'cat1', []);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].field).toBe('referralCode');
      });
    });

    it('should allow empty referral codes', () => {
      const result = service.validateReferralCode('', 'cat1', []);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect duplicate codes', () => {
      const existingCodes = ['existing123', 'another456'];
      const result = service.validateReferralCode('EXISTING123', 'cat1', existingCodes);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.message.includes('already exists'))).toBe(true);
    });

    it('should reject codes that are too long', () => {
      const longCode = 'a'.repeat(51);
      const result = service.validateReferralCode(longCode, 'cat1', []);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.message.includes('50 characters'))).toBe(true);
    });
  });

  describe('validateReferralOffer', () => {
    it('should validate complete referral offer', () => {
      const validOffer: Partial<ReferralOffer> = {
        title: 'Valid Offer',
        description: 'Valid description',
        referralLink: 'https://example.com',
        referralCode: 'VALID123',
        categoryId: 'cat1'
      };

      const result = service.validateReferralOffer(validOffer);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect missing required fields', () => {
      const incompleteOffer: Partial<ReferralOffer> = {
        description: 'Missing title and link'
      };

      const result = service.validateReferralOffer(incompleteOffer);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCreateReferralOfferRequest', () => {
    it('should validate complete create request', () => {
      const validRequest: CreateReferralOfferRequest = {
        title: 'New Offer',
        description: 'New description',
        referralLink: 'https://example.com',
        referralCode: 'NEW123',
        categoryId: 'cat1'
      };

      const result = service.validateCreateReferralOfferRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect validation errors in create request', () => {
      const invalidRequest: CreateReferralOfferRequest = {
        title: '', // Empty title
        description: 'Description',
        referralLink: 'invalid-url', // Invalid URL
        categoryId: 'cat1'
      };

      const result = service.validateCreateReferralOfferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCategory', () => {
    it('should validate complete category', () => {
      const validCategory: Partial<Category> = {
        name: 'Valid Category',
        icon: 'valid-icon',
        description: 'Valid description'
      };

      const result = service.validateCategory(validCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect missing required fields', () => {
      const incompleteCategory: Partial<Category> = {
        description: 'Missing name and icon'
      };

      const result = service.validateCategory(incompleteCategory);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCreateCategoryRequest', () => {
    it('should validate complete create category request', () => {
      const validRequest: CreateCategoryRequest = {
        name: 'New Category',
        icon: 'new-icon',
        description: 'New description'
      };

      const result = service.validateCreateCategoryRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect validation errors in create category request', () => {
      const invalidRequest: CreateCategoryRequest = {
        name: '', // Empty name
        icon: '', // Empty icon
        description: 'Description'
      };

      const result = service.validateCreateCategoryRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com'
      ];

      validEmails.forEach(email => {
        const result = service.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        '   ',
        'not-an-email',
        '@example.com',
        'user@',
        'user.example.com',
        'user@.com'
      ];

      invalidEmails.forEach(email => {
        const result = service.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validateFormField', () => {
    it('should validate field with single rule', () => {
      const rules: ValidationRule[] = [
        ValidationService.createValidationRules().required('Field is required')
      ];

      const validResult = service.validateFormField('testField', 'valid value', rules);
      expect(validResult.length).toBe(0);

      const invalidResult = service.validateFormField('testField', '', rules);
      expect(invalidResult.length).toBe(1);
      expect(invalidResult[0].field).toBe('testField');
    });

    it('should validate field with multiple rules', () => {
      const rules: ValidationRule[] = [
        ValidationService.createValidationRules().required(),
        ValidationService.createValidationRules().minLength(5),
        ValidationService.createValidationRules().maxLength(20)
      ];

      const validResult = service.validateFormField('testField', 'valid input', rules);
      expect(validResult.length).toBe(0);

      const invalidResult = service.validateFormField('testField', 'abc', rules);
      expect(invalidResult.length).toBe(1);
      expect(invalidResult[0].message).toContain('5 characters');
    });
  });

  describe('validateMultipleFields', () => {
    it('should validate multiple fields at once', () => {
      const data = {
        email: 'test@example.com',
        name: 'John Doe',
        age: 25
      };

      const fieldRules = {
        email: [ValidationService.createValidationRules().required(), ValidationService.createValidationRules().email()],
        name: [ValidationService.createValidationRules().required(), ValidationService.createValidationRules().minLength(2)],
        age: [ValidationService.createValidationRules().required()]
      };

      const result = service.validateMultipleFields(data, fieldRules);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect errors across multiple fields', () => {
      const data = {
        email: 'invalid-email',
        name: '',
        age: null
      };

      const fieldRules = {
        email: [ValidationService.createValidationRules().required(), ValidationService.createValidationRules().email()],
        name: [ValidationService.createValidationRules().required()],
        age: [ValidationService.createValidationRules().required()]
      };

      const result = service.validateMultipleFields(data, fieldRules);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
    });
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const htmlContent = '<p>Safe content</p><script>alert("dangerous")</script>';
      const sanitized = service.sanitizeHtml(htmlContent);
      
      expect(sanitized).toBeDefined();
      expect(typeof sanitized).toBe('string');
      // The exact sanitization behavior depends on the ModelValidation implementation
    });
  });

  describe('validateFileUpload', () => {
    it('should validate file size', () => {
      const smallFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(smallFile, 'size', { value: 1024 }); // 1KB

      const options: FileValidationOptions = {
        maxSize: 2048 // 2KB
      };

      const result = service.validateFileUpload(smallFile, options);
      expect(result.isValid).toBe(true);
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['content'], 'large.txt', { type: 'text/plain' });
      Object.defineProperty(largeFile, 'size', { value: 3072 }); // 3KB

      const options: FileValidationOptions = {
        maxSize: 2048 // 2KB
      };

      const result = service.validateFileUpload(largeFile, options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('size');
    });

    it('should validate file types', () => {
      const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      const options: FileValidationOptions = {
        allowedTypes: ['text/plain', 'image/jpeg']
      };

      const result = service.validateFileUpload(textFile, options);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid file types', () => {
      const execFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });

      const options: FileValidationOptions = {
        allowedTypes: ['text/plain', 'image/jpeg']
      };

      const result = service.validateFileUpload(execFile, options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('type not allowed');
    });

    it('should validate file extensions', () => {
      const imageFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });

      const options: FileValidationOptions = {
        allowedExtensions: ['jpg', 'png', 'gif']
      };

      const result = service.validateFileUpload(imageFile, options);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid file extensions', () => {
      const execFile = new File(['content'], 'malware.exe', { type: 'application/x-msdownload' });

      const options: FileValidationOptions = {
        allowedExtensions: ['jpg', 'png', 'gif']
      };

      const result = service.validateFileUpload(execFile, options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('extension not allowed');
    });

    it('should handle missing file', () => {
      const options: FileValidationOptions = {};

      const result = service.validateFileUpload(null as any, options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('ValidationService.createValidationRules', () => {
    const rules = ValidationService.createValidationRules();

    describe('required rule', () => {
      it('should validate required fields', () => {
        const rule = rules.required();
        
        expect(rule.validator('valid value').isValid).toBe(true);
        expect(rule.validator('').isValid).toBe(false);
        expect(rule.validator(null).isValid).toBe(false);
        expect(rule.validator(undefined).isValid).toBe(false);
        expect(rule.validator('   ').isValid).toBe(false);
      });

      it('should use custom message', () => {
        const rule = rules.required('Custom required message');
        const result = rule.validator('');
        
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Custom required message');
      });
    });

    describe('minLength rule', () => {
      it('should validate minimum length', () => {
        const rule = rules.minLength(5);
        
        expect(rule.validator('12345').isValid).toBe(true);
        expect(rule.validator('123456').isValid).toBe(true);
        expect(rule.validator('1234').isValid).toBe(false);
        expect(rule.validator('').isValid).toBe(true); // Empty is allowed
      });
    });

    describe('maxLength rule', () => {
      it('should validate maximum length', () => {
        const rule = rules.maxLength(5);
        
        expect(rule.validator('12345').isValid).toBe(true);
        expect(rule.validator('1234').isValid).toBe(true);
        expect(rule.validator('123456').isValid).toBe(false);
        expect(rule.validator('').isValid).toBe(true); // Empty is allowed
      });
    });

    describe('email rule', () => {
      it('should validate email format', () => {
        const rule = rules.email();
        
        expect(rule.validator('test@example.com').isValid).toBe(true);
        expect(rule.validator('invalid-email').isValid).toBe(false);
        expect(rule.validator('').isValid).toBe(true); // Empty is allowed
      });
    });

    describe('url rule', () => {
      it('should validate URL format', () => {
        const rule = rules.url();
        
        expect(rule.validator('https://example.com').isValid).toBe(true);
        expect(rule.validator('invalid-url').isValid).toBe(false);
        expect(rule.validator('').isValid).toBe(true); // Empty is allowed
      });
    });

    describe('pattern rule', () => {
      it('should validate against regex pattern', () => {
        const rule = rules.pattern(/^\d+$/, 'Must be numbers only');
        
        expect(rule.validator('12345').isValid).toBe(true);
        expect(rule.validator('abc123').isValid).toBe(false);
        expect(rule.validator('').isValid).toBe(true); // Empty is allowed
      });
    });

    describe('custom rule', () => {
      it('should use custom validation function', () => {
        const rule = rules.custom((value) => value === 'special', 'Must be special');
        
        expect(rule.validator('special').isValid).toBe(true);
        expect(rule.validator('normal').isValid).toBe(false);
      });
    });
  });
});