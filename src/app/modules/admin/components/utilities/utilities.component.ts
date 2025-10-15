import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  ReferralOffer, 
  Category,
  CategoryId,
  DEFAULT_CATEGORIES,
  SortDirection 
} from '../../../../models';
import { ReferralService, CategoryService, ValidationService } from '../../../../services';
import { HtmlSanitizerService } from '../../../../services/html-sanitizer.service';

interface LinkValidationResult {
  url: string;
  isValid: boolean;
  status?: number;
  error?: string;
  responseTime?: number;
}

interface CodeGenerationOptions {
  length: number;
  includeNumbers: boolean;
  includeLetters: boolean;
  includeSymbols: boolean;
  prefix: string;
  suffix: string;
  pattern: string;
}

@Component({
  selector: 'app-utilities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatChipsModule,
    MatSliderModule,
    MatDividerModule
  ],
  templateUrl: './utilities.component.html',
  styleUrl: './utilities.component.scss'
})
export class UtilitiesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Link Validation
  linkValidationForm: FormGroup;
  validationResults: LinkValidationResult[] = [];
  validatingLinks = false;
  
  // Code Generation
  codeGenerationForm: FormGroup;
  generatedCodes: string[] = [];
  codeOptions: CodeGenerationOptions = {
    length: 8,
    includeNumbers: true,
    includeLetters: true,
    includeSymbols: false,
    prefix: '',
    suffix: '',
    pattern: 'RANDOM'
  };
  
  // Content Preview
  previewForm: FormGroup;
  selectedOffer: ReferralOffer | null = null;
  previewDeviceType = 'desktop';
  offers: ReferralOffer[] = [];
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private referralService: ReferralService,
    private categoryService: CategoryService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    private htmlSanitizer: HtmlSanitizerService
  ) {
    this.linkValidationForm = this.createLinkValidationForm();
    this.codeGenerationForm = this.createCodeGenerationForm();
    this.previewForm = this.createPreviewForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createLinkValidationForm(): FormGroup {
    return this.fb.group({
      urls: ['', [Validators.required]],
      batchValidation: [false]
    });
  }

  private createCodeGenerationForm(): FormGroup {
    return this.fb.group({
      count: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
      categoryId: [''],
      customPattern: ['']
    });
  }

  private createPreviewForm(): FormGroup {
    return this.fb.group({
      offerId: ['', [Validators.required]]
    });
  }

  private loadData(): void {
    // Load categories
    this.categoryService.getActiveCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Load offers for preview
    this.referralService.getOffers({
      page: 1,
      limit: 50,
      isActive: true,
      sortBy: 'updatedAt',
      sortDirection: SortDirection.DESC
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.offers = response.data;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
      }
    });
  }

  // Link Validation Methods
  async validateLinks(): Promise<void> {
    if (this.linkValidationForm.invalid) {
      return;
    }

    this.validatingLinks = true;
    this.validationResults = [];

    const urlsText = this.linkValidationForm.get('urls')?.value || '';
    const urls = urlsText.split('\n')
      .map((url: string) => url.trim())
      .filter((url: string) => url.length > 0);

    if (urls.length === 0) {
      this.showSnackBar('Please enter at least one URL to validate');
      this.validatingLinks = false;
      return;
    }

    try {
      for (const url of urls) {
        const result = await this.validateSingleLink(url);
        this.validationResults.push(result);
      }
      
      const validCount = this.validationResults.filter(r => r.isValid).length;
      this.showSnackBar(`Validation complete: ${validCount}/${urls.length} links are valid`);
    } catch (error) {
      console.error('Error validating links:', error);
      this.showSnackBar('Error occurred during link validation');
    } finally {
      this.validatingLinks = false;
    }
  }

  private async validateSingleLink(url: string): Promise<LinkValidationResult> {
    const startTime = Date.now();
    
    try {
      // Basic URL format validation
      const urlValidation = this.validationService.validateUrl(url);
      const urlResult = await urlValidation.toPromise();
      
      if (!urlResult?.isValid) {
        return {
          url,
          isValid: false,
          error: urlResult?.error || 'Invalid URL format',
          responseTime: Date.now() - startTime
        };
      }

      // Try to check accessibility (limited by CORS)
      try {
        const response = await fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        return {
          url,
          isValid: true,
          status: response.status,
          responseTime: Date.now() - startTime
        };
      } catch (fetchError) {
        // If fetch fails due to CORS, we'll consider the URL format valid
        // but note that we couldn't check accessibility
        return {
          url,
          isValid: true,
          error: 'Could not verify accessibility (CORS restriction)',
          responseTime: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        url,
        isValid: false,
        error: 'Validation failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  clearValidationResults(): void {
    this.validationResults = [];
    this.linkValidationForm.patchValue({ urls: '' });
  }

  exportValidationResults(): void {
    if (this.validationResults.length === 0) {
      this.showSnackBar('No validation results to export');
      return;
    }

    const csvContent = this.generateValidationCSV();
    this.downloadCSV(csvContent, 'link-validation-results.csv');
    this.showSnackBar('Validation results exported');
  }

  private generateValidationCSV(): string {
    const headers = ['URL', 'Valid', 'Status', 'Error', 'Response Time (ms)'];
    const rows = this.validationResults.map(result => [
      result.url,
      result.isValid ? 'Yes' : 'No',
      result.status?.toString() || '',
      result.error || '',
      result.responseTime?.toString() || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  // Code Generation Methods
  generateCodes(): void {
    if (this.codeGenerationForm.invalid) {
      return;
    }

    const count = this.codeGenerationForm.get('count')?.value || 5;
    const categoryId = this.codeGenerationForm.get('categoryId')?.value;
    const customPattern = this.codeGenerationForm.get('customPattern')?.value;

    this.generatedCodes = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateSingleCode(categoryId, customPattern);
      this.generatedCodes.push(code);
    }

    this.showSnackBar(`Generated ${count} referral codes`);
  }

  private generateSingleCode(categoryId?: string, customPattern?: string): string {
    if (customPattern && customPattern.trim()) {
      return this.generateFromPattern(customPattern);
    }

    let code = '';
    const { length, includeNumbers, includeLetters, includeSymbols, prefix, suffix } = this.codeOptions;

    // Add prefix
    if (prefix) {
      code += prefix;
    }

    // Add category prefix if selected
    if (categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        code += category.name.substring(0, 3).toUpperCase();
      }
    }

    // Generate random part
    const chars = this.getCharacterSet(includeNumbers, includeLetters, includeSymbols);
    const randomLength = Math.max(1, length - code.length - (suffix?.length || 0));
    
    for (let i = 0; i < randomLength; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add suffix
    if (suffix) {
      code += suffix;
    }

    return code;
  }

  private generateFromPattern(pattern: string): string {
    return pattern
      .replace(/X/g, () => this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
      .replace(/x/g, () => this.getRandomChar('abcdefghijklmnopqrstuvwxyz'))
      .replace(/9/g, () => this.getRandomChar('0123456789'))
      .replace(/\*/g, () => this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'));
  }

  private getCharacterSet(includeNumbers: boolean, includeLetters: boolean, includeSymbols: boolean): string {
    let chars = '';
    if (includeLetters) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*';
    return chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }

  private getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.showSnackBar('Code copied to clipboard');
    }).catch(() => {
      this.showSnackBar('Failed to copy code');
    });
  }

  copyAllCodes(): void {
    if (this.generatedCodes.length === 0) {
      this.showSnackBar('No codes to copy');
      return;
    }

    const allCodes = this.generatedCodes.join('\n');
    navigator.clipboard.writeText(allCodes).then(() => {
      this.showSnackBar('All codes copied to clipboard');
    }).catch(() => {
      this.showSnackBar('Failed to copy codes');
    });
  }

  clearGeneratedCodes(): void {
    this.generatedCodes = [];
  }

  // Content Preview Methods
  loadOfferPreview(): void {
    const offerId = this.previewForm.get('offerId')?.value;
    if (!offerId) {
      return;
    }

    this.selectedOffer = this.offers.find(offer => offer.id === offerId) || null;
  }

  changePreviewDevice(deviceType: string): void {
    this.previewDeviceType = deviceType;
  }

  getPreviewFrameClass(): string {
    switch (this.previewDeviceType) {
      case 'mobile': return 'preview-mobile';
      case 'tablet': return 'preview-tablet';
      default: return 'preview-desktop';
    }
  }

  getCategoryForOffer(categoryId: string): Category | undefined {
    return this.categories.find(c => c.id === categoryId);
  }

  getSanitizedDescription(description: string): string {
    return this.htmlSanitizer.sanitize(description);
  }

  // Utility Methods
  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getValidResultsCount(): number {
    return this.validationResults.filter(r => r.isValid).length;
  }

  getInvalidResultsCount(): number {
    return this.validationResults.filter(r => !r.isValid).length;
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}