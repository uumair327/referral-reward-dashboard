import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss'
})
export class RichTextEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  
  @Input() placeholder = 'Enter your content here...';
  @Input() maxLength = 1000;
  @Input() autoSave = false;
  @Input() autoSaveDelay = 2000;
  
  @Output() contentChange = new EventEmitter<string>();
  @Output() autoSaveTriggered = new EventEmitter<string>();

  private destroy$ = new Subject<void>();
  private autoSaveSubject = new Subject<string>();
  
  content = '';
  isPreviewMode = false;
  characterCount = 0;
  
  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {}

  ngOnInit(): void {
    this.setupEditor();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupEditor(): void {
    const editor = this.editorRef.nativeElement;
    editor.contentEditable = 'true';
    editor.innerHTML = this.content;
    
    // Handle input events
    editor.addEventListener('input', () => {
      this.updateContent();
    });
    
    // Handle paste events to clean up formatting
    editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });
    
    // Handle focus events
    editor.addEventListener('focus', () => {
      this.onTouched();
    });
  }

  private setupAutoSave(): void {
    if (this.autoSave) {
      this.autoSaveSubject.pipe(
        debounceTime(this.autoSaveDelay),
        takeUntil(this.destroy$)
      ).subscribe(content => {
        this.autoSaveTriggered.emit(content);
      });
    }
  }

  private updateContent(): void {
    const editor = this.editorRef.nativeElement;
    this.content = editor.innerHTML;
    this.characterCount = editor.textContent?.length || 0;
    
    this.onChange(this.content);
    this.contentChange.emit(this.content);
    
    if (this.autoSave) {
      this.autoSaveSubject.next(this.content);
    }
  }

  // Formatting commands
  execCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorRef.nativeElement.focus();
    this.updateContent();
  }

  // Toolbar actions
  toggleBold(): void {
    this.execCommand('bold');
  }

  toggleItalic(): void {
    this.execCommand('italic');
  }

  toggleUnderline(): void {
    this.execCommand('underline');
  }

  insertUnorderedList(): void {
    this.execCommand('insertUnorderedList');
  }

  insertOrderedList(): void {
    this.execCommand('insertOrderedList');
  }

  createLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  unlink(): void {
    this.execCommand('unlink');
  }

  insertHorizontalRule(): void {
    this.execCommand('insertHorizontalRule');
  }

  formatBlock(tag: string): void {
    this.execCommand('formatBlock', tag);
  }

  removeFormat(): void {
    this.execCommand('removeFormat');
  }

  // Utility methods
  togglePreview(): void {
    this.isPreviewMode = !this.isPreviewMode;
  }

  clearContent(): void {
    if (confirm('Are you sure you want to clear all content?')) {
      this.editorRef.nativeElement.innerHTML = '';
      this.updateContent();
    }
  }

  getPlainText(): string {
    return this.editorRef.nativeElement.textContent || '';
  }

  getHtmlContent(): string {
    return this.content;
  }

  isCharacterLimitExceeded(): boolean {
    return this.characterCount > this.maxLength;
  }

  getRemainingCharacters(): number {
    return Math.max(0, this.maxLength - this.characterCount);
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null | undefined): void {
    this.content = value || '';
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.content;
      this.characterCount = this.editorRef.nativeElement.textContent?.length || 0;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }

  // Validation helpers
  hasContent(): boolean {
    return this.getPlainText().trim().length > 0;
  }

  isValidLength(): boolean {
    return this.characterCount <= this.maxLength;
  }

  // Sanitization (enhanced)
  sanitizeContent(html: string): string {
    if (!html) return '';
    
    let sanitized = html;
    
    // First, decode HTML entities if they exist
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const decodedHtml = tempDiv.textContent || tempDiv.innerText || '';
    
    // If the decoded content contains HTML tags, it means HTML was stored as entities
    if (decodedHtml.includes('<') && decodedHtml.includes('>')) {
      sanitized = decodedHtml;
    }
    
    // Remove dangerous elements and attributes
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    // Clean up empty HTML tags and excessive whitespace
    sanitized = sanitized
      .replace(/<div>\s*<\/div>/gi, '') // Remove empty divs
      .replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
      .replace(/<br>\s*<br>/gi, '<br>') // Remove duplicate line breaks
      .replace(/(<br>\s*){3,}/gi, '<br><br>') // Limit consecutive line breaks
      .replace(/^\s*(<br>\s*)+/gi, '') // Remove leading line breaks
      .replace(/(<br>\s*)+\s*$/gi, '') // Remove trailing line breaks
      .trim();
    
    return sanitized;
  }
}