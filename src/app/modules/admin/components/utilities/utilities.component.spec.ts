import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { UtilitiesComponent } from './utilities.component';
import { ReferralService, CategoryService, ValidationService } from '../../../../services';
import { 
  ReferralOffer, 
  Category, 
  PaginatedResponse,
  SortDirection 
} from '../../../../models';

describe('UtilitiesComponent', () => {
  let component: UtilitiesComponent;
  let fixture: ComponentFixture<UtilitiesComponent>;
  let referralService: jasmine.SpyObj<ReferralService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let validationService: jasmine.SpyObj<ValidationService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Finance',
      icon: 'account_balance',
      description: 'Financial services',
      isActive: true,
      offerCount: 5,
      displayOrder: 1
    },
    {
      id: 'cat2',
      name: 'Health',
      icon: 'local_hospital',
      description: 'Healthcare services',
      isActive: true,
      offerCount: 3,
      displayOrder: 2
    }
  ];

  const mockOffers: ReferralOffer[] = [
    {
      id: 'offer1',
      title: 'Test Offer 1',
      description: 'Test Description 1',
      referralLink: 'https://example.com/1',
      referralCode: 'TEST1',
      categoryId: 'cat1',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      clickCount: 10
    },
    {
      id: 'offer2',
      title: 'Test Offer 2',
      description: 'Test Description 2',
      referralLink: 'https://example.com/2',
      referralCode: 'TEST2',
      categoryId: 'cat2',
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      clickCount: 5
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<ReferralOffer> = {
    data: mockOffers,
    total: 2,
    page: 1,
    limit: 50,
    totalPages: 1
  };

  beforeEach(async () => {
    const referralServiceSpy = jasmine.createSpyObj('ReferralService', ['getOffers']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getActiveCategories']);
    const validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateUrl']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        UtilitiesComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ReferralService, useValue: referralServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    referralService = TestBed.inject(ReferralService) as jasmine.SpyObj<ReferralService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    categoryService.getActiveCategories.and.returnValue(of(mockCategories));
    referralService.getOffers.and.returnValue(of(mockPaginatedResponse));

    fixture = TestBed.createComponent(UtilitiesComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize forms correctly', () => {
      expect(component.linkValidationForm).toBeDefined();
      expect(component.codeGenerationForm).toBeDefined();
      expect(component.previewForm).toBeDefined();
    });

    it('should initialize default values', () => {
      expect(component.validationResults).toEqual([]);
      expect(component.generatedCodes).toEqual([]);
      expect(component.validatingLinks).toBe(false);
      expect(component.selectedOffer).toBeNull();
      expect(component.previewDeviceType).toBe('desktop');
    });

    it('should load data on init', () => {
      fixture.detectChanges();
      
      expect(categoryService.getActiveCategories).toHaveBeenCalled();
      expect(referralService.getOffers).toHaveBeenCalledWith({
        page: 1,
        limit: 50,
        isActive: true,
        sortBy: 'updatedAt',
        sortDirection: SortDirection.DESC
      });
      expect(component.categories).toEqual(mockCategories);
      expect(component.offers).toEqual(mockOffers);
    });

    it('should handle data loading errors gracefully', () => {
      categoryService.getActiveCategories.and.returnValue(throwError('Category error'));
      referralService.getOffers.and.returnValue(throwError('Offer error'));
      spyOn(console, 'error');
      
      fixture.detectChanges();
      
      expect(console.error).toHaveBeenCalledWith('Error loading categories:', 'Category error');
      expect(console.error).toHaveBeenCalledWith('Error loading offers:', 'Offer error');
    });
  });

  describe('Link Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate single URL successfully', async () => {
      validationService.validateUrl.and.returnValue(of({ isValid: true }));
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('', { status: 200 })));
      
      component.linkValidationForm.patchValue({ urls: 'https://example.com' });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(1);
      expect(component.validationResults[0].isValid).toBe(true);
      expect(component.validationResults[0].url).toBe('https://example.com');
      expect(snackBar.open).toHaveBeenCalledWith('Validation complete: 1/1 links are valid', 'Close', jasmine.any(Object));
    });

    it('should validate multiple URLs', async () => {
      validationService.validateUrl.and.returnValue(of({ isValid: true }));
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('', { status: 200 })));
      
      component.linkValidationForm.patchValue({ 
        urls: 'https://example.com\nhttps://google.com\nhttps://github.com' 
      });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(3);
      expect(snackBar.open).toHaveBeenCalledWith('Validation complete: 3/3 links are valid', 'Close', jasmine.any(Object));
    });

    it('should handle invalid URL format', async () => {
      validationService.validateUrl.and.returnValue(of({ isValid: false, error: 'Invalid URL format' }));
      
      component.linkValidationForm.patchValue({ urls: 'invalid-url' });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(1);
      expect(component.validationResults[0].isValid).toBe(false);
      expect(component.validationResults[0].error).toBe('Invalid URL format');
    });

    it('should handle fetch errors gracefully', async () => {
      validationService.validateUrl.and.returnValue(of({ isValid: true }));
      spyOn(window, 'fetch').and.returnValue(Promise.reject('Network error'));
      
      component.linkValidationForm.patchValue({ urls: 'https://example.com' });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(1);
      expect(component.validationResults[0].isValid).toBe(false);
      expect(component.validationResults[0].error).toBe('Validation failed');
    });

    it('should handle CORS restrictions', async () => {
      validationService.validateUrl.and.returnValue(of({ isValid: true }));
      spyOn(window, 'fetch').and.returnValue(Promise.reject('CORS error'));
      
      component.linkValidationForm.patchValue({ urls: 'https://example.com' });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(1);
      expect(component.validationResults[0].isValid).toBe(false);
    });

    it('should not validate if form is invalid', async () => {
      component.linkValidationForm.patchValue({ urls: '' });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(0);
    });

    it('should show error for empty URLs', async () => {
      component.linkValidationForm.patchValue({ urls: '   \n   \n   ' });
      
      await component.validateLinks();
      
      expect(snackBar.open).toHaveBeenCalledWith('Please enter at least one URL to validate', 'Close', jasmine.any(Object));
    });

    it('should clear validation results', () => {
      component.validationResults = [
        { url: 'https://example.com', isValid: true }
      ];
      component.linkValidationForm.patchValue({ urls: 'test urls' });
      
      component.clearValidationResults();
      
      expect(component.validationResults).toEqual([]);
      expect(component.linkValidationForm.get('urls')?.value).toBe('');
    });

    it('should export validation results as CSV', () => {
      component.validationResults = [
        { url: 'https://example.com', isValid: true, status: 200, responseTime: 150 },
        { url: 'https://invalid.com', isValid: false, error: 'Not found', responseTime: 100 }
      ];
      
      spyOn(component, 'downloadCSV' as any);
      
      component.exportValidationResults();
      
      expect(component['downloadCSV']).toHaveBeenCalledWith(jasmine.any(String), 'link-validation-results.csv');
      expect(snackBar.open).toHaveBeenCalledWith('Validation results exported', 'Close', jasmine.any(Object));
    });

    it('should not export if no results', () => {
      component.validationResults = [];
      
      component.exportValidationResults();
      
      expect(snackBar.open).toHaveBeenCalledWith('No validation results to export', 'Close', jasmine.any(Object));
    });

    it('should count valid and invalid results', () => {
      component.validationResults = [
        { url: 'https://example.com', isValid: true },
        { url: 'https://invalid.com', isValid: false },
        { url: 'https://google.com', isValid: true }
      ];
      
      expect(component.getValidResultsCount()).toBe(2);
      expect(component.getInvalidResultsCount()).toBe(1);
    });
  });

  describe('Code Generation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should generate codes with default options', () => {
      component.codeGenerationForm.patchValue({ count: 3 });
      
      component.generateCodes();
      
      expect(component.generatedCodes.length).toBe(3);
      expect(snackBar.open).toHaveBeenCalledWith('Generated 3 referral codes', 'Close', jasmine.any(Object));
    });

    it('should generate codes with category prefix', () => {
      component.codeGenerationForm.patchValue({ 
        count: 2,
        categoryId: 'cat1'
      });
      
      component.generateCodes();
      
      expect(component.generatedCodes.length).toBe(2);
      component.generatedCodes.forEach(code => {
        expect(code).toContain('FIN'); // First 3 letters of "Finance"
      });
    });

    it('should generate codes with custom pattern', () => {
      component.codeGenerationForm.patchValue({ 
        count: 2,
        customPattern: 'TEST-XXX-999'
      });
      
      component.generateCodes();
      
      expect(component.generatedCodes.length).toBe(2);
      component.generatedCodes.forEach(code => {
        expect(code).toMatch(/^TEST-[A-Z]{3}-[0-9]{3}$/);
      });
    });

    it('should generate codes with prefix and suffix', () => {
      component.codeOptions.prefix = 'PRE';
      component.codeOptions.suffix = 'SUF';
      component.codeGenerationForm.patchValue({ count: 1 });
      
      component.generateCodes();
      
      expect(component.generatedCodes[0]).toMatch(/^PRE.*SUF$/);
    });

    it('should generate codes with different character sets', () => {
      component.codeOptions.includeNumbers = true;
      component.codeOptions.includeLetters = true;
      component.codeOptions.includeSymbols = false;
      component.codeGenerationForm.patchValue({ count: 1 });
      
      component.generateCodes();
      
      expect(component.generatedCodes.length).toBe(1);
      expect(component.generatedCodes[0]).toMatch(/^[A-Z0-9]+$/);
    });

    it('should not generate if form is invalid', () => {
      component.codeGenerationForm.patchValue({ count: 0 }); // Invalid count
      
      component.generateCodes();
      
      expect(component.generatedCodes.length).toBe(0);
    });

    it('should copy single code to clipboard', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      
      component.copyCode('TEST123');
      
      await fixture.whenStable();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TEST123');
      expect(snackBar.open).toHaveBeenCalledWith('Code copied to clipboard', 'Close', jasmine.any(Object));
    });

    it('should handle clipboard copy errors', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject('Clipboard error'));
      
      component.copyCode('TEST123');
      
      await fixture.whenStable();
      
      expect(snackBar.open).toHaveBeenCalledWith('Failed to copy code', 'Close', jasmine.any(Object));
    });

    it('should copy all codes to clipboard', async () => {
      component.generatedCodes = ['CODE1', 'CODE2', 'CODE3'];
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      
      component.copyAllCodes();
      
      await fixture.whenStable();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('CODE1\nCODE2\nCODE3');
      expect(snackBar.open).toHaveBeenCalledWith('All codes copied to clipboard', 'Close', jasmine.any(Object));
    });

    it('should not copy if no codes generated', () => {
      component.generatedCodes = [];
      
      component.copyAllCodes();
      
      expect(snackBar.open).toHaveBeenCalledWith('No codes to copy', 'Close', jasmine.any(Object));
    });

    it('should clear generated codes', () => {
      component.generatedCodes = ['CODE1', 'CODE2'];
      
      component.clearGeneratedCodes();
      
      expect(component.generatedCodes).toEqual([]);
    });
  });

  describe('Content Preview', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load offer preview', () => {
      component.previewForm.patchValue({ offerId: 'offer1' });
      
      component.loadOfferPreview();
      
      expect(component.selectedOffer).toEqual(mockOffers[0]);
    });

    it('should not load preview if no offer ID', () => {
      component.previewForm.patchValue({ offerId: '' });
      
      component.loadOfferPreview();
      
      expect(component.selectedOffer).toBeNull();
    });

    it('should handle non-existent offer ID', () => {
      component.previewForm.patchValue({ offerId: 'non-existent' });
      
      component.loadOfferPreview();
      
      expect(component.selectedOffer).toBeNull();
    });

    it('should change preview device type', () => {
      component.changePreviewDevice('mobile');
      expect(component.previewDeviceType).toBe('mobile');
      
      component.changePreviewDevice('tablet');
      expect(component.previewDeviceType).toBe('tablet');
      
      component.changePreviewDevice('desktop');
      expect(component.previewDeviceType).toBe('desktop');
    });

    it('should get correct preview frame class', () => {
      component.previewDeviceType = 'mobile';
      expect(component.getPreviewFrameClass()).toBe('preview-mobile');
      
      component.previewDeviceType = 'tablet';
      expect(component.getPreviewFrameClass()).toBe('preview-tablet');
      
      component.previewDeviceType = 'desktop';
      expect(component.getPreviewFrameClass()).toBe('preview-desktop');
    });

    it('should get category for offer', () => {
      const category = component.getCategoryForOffer('cat1');
      expect(category).toEqual(mockCategories[0]);
      
      const nonExistent = component.getCategoryForOffer('non-existent');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Pattern Generation', () => {
    it('should generate from pattern with uppercase letters', () => {
      const result = component['generateFromPattern']('XXX-999');
      expect(result).toMatch(/^[A-Z]{3}-[0-9]{3}$/);
    });

    it('should generate from pattern with lowercase letters', () => {
      const result = component['generateFromPattern']('xxx-999');
      expect(result).toMatch(/^[a-z]{3}-[0-9]{3}$/);
    });

    it('should generate from pattern with mixed characters', () => {
      const result = component['generateFromPattern']('X*x9');
      expect(result).toMatch(/^[A-Z][A-Z0-9][a-z][0-9]$/);
    });

    it('should preserve literal characters in pattern', () => {
      const result = component['generateFromPattern']('TEST-X9');
      expect(result).toMatch(/^TEST-[A-Z][0-9]$/);
    });
  });

  describe('Character Set Generation', () => {
    it('should generate character set with letters only', () => {
      const charset = component['getCharacterSet'](false, true, false);
      expect(charset).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('should generate character set with numbers only', () => {
      const charset = component['getCharacterSet'](true, false, false);
      expect(charset).toBe('0123456789');
    });

    it('should generate character set with symbols only', () => {
      const charset = component['getCharacterSet'](false, false, true);
      expect(charset).toBe('!@#$%^&*');
    });

    it('should generate character set with all types', () => {
      const charset = component['getCharacterSet'](true, true, true);
      expect(charset).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*');
    });

    it('should fallback to default charset if none selected', () => {
      const charset = component['getCharacterSet'](false, false, false);
      expect(charset).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    });
  });

  describe('CSV Generation and Download', () => {
    it('should generate CSV content correctly', () => {
      component.validationResults = [
        { url: 'https://example.com', isValid: true, status: 200, responseTime: 150 },
        { url: 'https://invalid.com', isValid: false, error: 'Not found', responseTime: 100 }
      ];
      
      const csv = component['generateValidationCSV']();
      
      expect(csv).toContain('URL,Valid,Status,Error,Response Time (ms)');
      expect(csv).toContain('"https://example.com","Yes","200","","150"');
      expect(csv).toContain('"https://invalid.com","No","","Not found","100"');
    });

    it('should create and trigger download', () => {
      spyOn(document, 'createElement').and.returnValue({
        setAttribute: jasmine.createSpy(),
        click: jasmine.createSpy(),
        style: { visibility: '' }
      } as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      spyOn(URL, 'createObjectURL').and.returnValue('blob-url');
      
      component['downloadCSV']('test,content', 'test.csv');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate link validation form', () => {
      expect(component.linkValidationForm.valid).toBe(false);
      
      component.linkValidationForm.patchValue({ urls: 'https://example.com' });
      expect(component.linkValidationForm.valid).toBe(true);
    });

    it('should validate code generation form', () => {
      expect(component.codeGenerationForm.valid).toBe(true); // Default values are valid
      
      component.codeGenerationForm.patchValue({ count: 0 });
      expect(component.codeGenerationForm.valid).toBe(false);
      
      component.codeGenerationForm.patchValue({ count: 101 });
      expect(component.codeGenerationForm.valid).toBe(false);
      
      component.codeGenerationForm.patchValue({ count: 5 });
      expect(component.codeGenerationForm.valid).toBe(true);
    });

    it('should validate preview form', () => {
      expect(component.previewForm.valid).toBe(false);
      
      component.previewForm.patchValue({ offerId: 'offer1' });
      expect(component.previewForm.valid).toBe(true);
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display tabs for different utilities', () => {
      const tabGroup = fixture.nativeElement.querySelector('mat-tab-group');
      expect(tabGroup).toBeTruthy();
      
      const tabs = fixture.nativeElement.querySelectorAll('mat-tab');
      expect(tabs.length).toBeGreaterThanOrEqual(3); // Link validation, code generation, preview
    });

    it('should display validation results table when results exist', () => {
      component.validationResults = [
        { url: 'https://example.com', isValid: true, status: 200 }
      ];
      fixture.detectChanges();
      
      const resultsTable = fixture.nativeElement.querySelector('.validation-results mat-table');
      expect(resultsTable).toBeTruthy();
    });

    it('should display generated codes when codes exist', () => {
      component.generatedCodes = ['CODE1', 'CODE2'];
      fixture.detectChanges();
      
      const codesList = fixture.nativeElement.querySelector('.generated-codes');
      expect(codesList).toBeTruthy();
    });

    it('should display preview when offer is selected', () => {
      component.selectedOffer = mockOffers[0];
      fixture.detectChanges();
      
      const previewFrame = fixture.nativeElement.querySelector('.preview-frame');
      expect(previewFrame).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle validation service errors', async () => {
      validationService.validateUrl.and.returnValue(throwError(() => new Error('Service error')));
      
      component.linkValidationForm.patchValue({ urls: 'https://example.com' });
      
      await component.validateLinks();
      
      expect(component.validationResults.length).toBe(1);
      expect(component.validationResults[0].isValid).toBe(false);
      expect(component.validationResults[0].error).toBe('Validation failed');
    });

    it('should handle clipboard API not available', async () => {
      // Mock clipboard not available
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true
      });
      
      expect(() => {
        component.copyCode('TEST123');
      }).not.toThrow();
    });

    it('should handle missing offer data gracefully', () => {
      component.offers = [];
      component.previewForm.patchValue({ offerId: 'offer1' });
      
      component.loadOfferPreview();
      
      expect(component.selectedOffer).toBeNull();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels on form controls', () => {
      const formFields = fixture.nativeElement.querySelectorAll('mat-form-field');
      formFields.forEach((field: HTMLElement) => {
        const input = field.querySelector('input, textarea, mat-select');
        expect(input?.getAttribute('aria-label') || input?.getAttribute('aria-labelledby')).toBeTruthy();
      });
    });

    it('should have proper button labels', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.textContent?.trim() || button.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });
});