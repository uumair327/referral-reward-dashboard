import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RichTextEditorComponent } from './rich-text-editor.component';

describe('RichTextEditorComponent', () => {
  let component: RichTextEditorComponent;
  let fixture: ComponentFixture<RichTextEditorComponent>;
  let editorElement: HTMLDivElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RichTextEditorComponent,
        NoopAnimationsModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    editorElement = component.editorRef.nativeElement;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.placeholder).toBe('Enter your content here...');
      expect(component.maxLength).toBe(1000);
      expect(component.autoSave).toBe(false);
      expect(component.autoSaveDelay).toBe(2000);
      expect(component.content).toBe('');
      expect(component.isPreviewMode).toBe(false);
      expect(component.characterCount).toBe(0);
    });

    it('should setup editor element correctly', () => {
      expect(editorElement.contentEditable).toBe('true');
      expect(editorElement.innerHTML).toBe('');
    });

    it('should have proper input properties', () => {
      component.placeholder = 'Custom placeholder';
      component.maxLength = 500;
      component.autoSave = true;
      component.autoSaveDelay = 1000;
      
      expect(component.placeholder).toBe('Custom placeholder');
      expect(component.maxLength).toBe(500);
      expect(component.autoSave).toBe(true);
      expect(component.autoSaveDelay).toBe(1000);
    });
  });

  describe('Content Management', () => {
    it('should update content when editor content changes', () => {
      spyOn(component.contentChange, 'emit');
      
      editorElement.innerHTML = '<p>Test content</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      expect(component.content).toBe('<p>Test content</p>');
      expect(component.characterCount).toBe(12); // "Test content" length
      expect(component.contentChange.emit).toHaveBeenCalledWith('<p>Test content</p>');
    });

    it('should get plain text content', () => {
      editorElement.innerHTML = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      
      const plainText = component.getPlainText();
      
      expect(plainText).toBe('Bold and italic text');
    });

    it('should get HTML content', () => {
      component.content = '<p>HTML content</p>';
      
      const htmlContent = component.getHtmlContent();
      
      expect(htmlContent).toBe('<p>HTML content</p>');
    });

    it('should check if content exists', () => {
      expect(component.hasContent()).toBe(false);
      
      editorElement.textContent = 'Some content';
      expect(component.hasContent()).toBe(true);
      
      editorElement.textContent = '   '; // Only whitespace
      expect(component.hasContent()).toBe(false);
    });

    it('should clear content with confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'updateContent' as any);
      
      editorElement.innerHTML = '<p>Content to clear</p>';
      component.clearContent();
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all content?');
      expect(editorElement.innerHTML).toBe('');
      expect(component['updateContent']).toHaveBeenCalled();
    });

    it('should not clear content if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      editorElement.innerHTML = '<p>Content to keep</p>';
      const originalContent = editorElement.innerHTML;
      
      component.clearContent();
      
      expect(editorElement.innerHTML).toBe(originalContent);
    });
  });

  describe('Character Limit Management', () => {
    beforeEach(() => {
      component.maxLength = 10;
    });

    it('should track character count correctly', () => {
      editorElement.textContent = 'Hello';
      editorElement.dispatchEvent(new Event('input'));
      
      expect(component.characterCount).toBe(5);
    });

    it('should check if character limit is exceeded', () => {
      component.characterCount = 5;
      expect(component.isCharacterLimitExceeded()).toBe(false);
      
      component.characterCount = 15;
      expect(component.isCharacterLimitExceeded()).toBe(true);
    });

    it('should calculate remaining characters', () => {
      component.characterCount = 3;
      expect(component.getRemainingCharacters()).toBe(7);
      
      component.characterCount = 12;
      expect(component.getRemainingCharacters()).toBe(0);
    });

    it('should validate content length', () => {
      component.characterCount = 8;
      expect(component.isValidLength()).toBe(true);
      
      component.characterCount = 15;
      expect(component.isValidLength()).toBe(false);
    });
  });

  describe('Formatting Commands', () => {
    beforeEach(() => {
      spyOn(document, 'execCommand');
      spyOn(editorElement, 'focus');
      spyOn(component, 'updateContent' as any);
    });

    it('should execute bold command', () => {
      component.toggleBold();
      
      expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
      expect(editorElement.focus).toHaveBeenCalled();
      expect(component['updateContent']).toHaveBeenCalled();
    });

    it('should execute italic command', () => {
      component.toggleItalic();
      
      expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
      expect(editorElement.focus).toHaveBeenCalled();
    });

    it('should execute underline command', () => {
      component.toggleUnderline();
      
      expect(document.execCommand).toHaveBeenCalledWith('underline', false, undefined);
      expect(editorElement.focus).toHaveBeenCalled();
    });

    it('should insert unordered list', () => {
      component.insertUnorderedList();
      
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
    });

    it('should insert ordered list', () => {
      component.insertOrderedList();
      
      expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, undefined);
    });

    it('should create link with user input', () => {
      spyOn(window, 'prompt').and.returnValue('https://example.com');
      
      component.createLink();
      
      expect(window.prompt).toHaveBeenCalledWith('Enter URL:');
      expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com');
    });

    it('should not create link if user cancels', () => {
      spyOn(window, 'prompt').and.returnValue(null);
      
      component.createLink();
      
      expect(document.execCommand).not.toHaveBeenCalledWith('createLink', jasmine.any(Boolean), jasmine.any(String));
    });

    it('should remove link', () => {
      component.unlink();
      
      expect(document.execCommand).toHaveBeenCalledWith('unlink', false, undefined);
    });

    it('should insert horizontal rule', () => {
      component.insertHorizontalRule();
      
      expect(document.execCommand).toHaveBeenCalledWith('insertHorizontalRule', false, undefined);
    });

    it('should format block with specified tag', () => {
      component.formatBlock('h1');
      
      expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h1');
    });

    it('should remove formatting', () => {
      component.removeFormat();
      
      expect(document.execCommand).toHaveBeenCalledWith('removeFormat', false, undefined);
    });

    it('should execute custom command with value', () => {
      component.execCommand('fontSize', '14px');
      
      expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '14px');
    });
  });

  describe('Preview Mode', () => {
    it('should toggle preview mode', () => {
      expect(component.isPreviewMode).toBe(false);
      
      component.togglePreview();
      expect(component.isPreviewMode).toBe(true);
      
      component.togglePreview();
      expect(component.isPreviewMode).toBe(false);
    });

    it('should display preview mode in template', () => {
      component.content = '<p>Preview content</p>';
      component.isPreviewMode = true;
      fixture.detectChanges();
      
      const previewElement = fixture.nativeElement.querySelector('.preview-content');
      expect(previewElement).toBeTruthy();
    });
  });

  describe('Auto-save Functionality', () => {
    beforeEach(() => {
      component.autoSave = true;
      component.autoSaveDelay = 100; // Short delay for testing
    });

    it('should emit auto-save event after delay', fakeAsync(() => {
      spyOn(component.autoSaveTriggered, 'emit');
      component.ngOnInit(); // Re-initialize with autoSave enabled
      
      editorElement.innerHTML = '<p>Auto-save content</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      tick(50); // Half the delay
      expect(component.autoSaveTriggered.emit).not.toHaveBeenCalled();
      
      tick(100); // Complete the delay
      expect(component.autoSaveTriggered.emit).toHaveBeenCalledWith('<p>Auto-save content</p>');
    }));

    it('should debounce auto-save events', fakeAsync(() => {
      spyOn(component.autoSaveTriggered, 'emit');
      component.ngOnInit(); // Re-initialize with autoSave enabled
      
      // Rapid changes
      editorElement.innerHTML = '<p>Content 1</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      tick(50);
      
      editorElement.innerHTML = '<p>Content 2</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      tick(50);
      
      editorElement.innerHTML = '<p>Content 3</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      tick(100); // Complete the delay
      
      // Should only emit once with the latest content
      expect(component.autoSaveTriggered.emit).toHaveBeenCalledTimes(1);
      expect(component.autoSaveTriggered.emit).toHaveBeenCalledWith('<p>Content 3</p>');
    }));

    it('should not setup auto-save when disabled', () => {
      component.autoSave = false;
      spyOn(component.autoSaveTriggered, 'emit');
      
      component.ngOnInit();
      
      editorElement.innerHTML = '<p>No auto-save</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      expect(component.autoSaveTriggered.emit).not.toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should write value to editor', () => {
      const testContent = '<p>Test content</p>';
      
      component.writeValue(testContent);
      
      expect(component.content).toBe(testContent);
      expect(editorElement.innerHTML).toBe(testContent);
    });

    it('should handle null/undefined values', () => {
      component.writeValue(null);
      expect(component.content).toBe('');
      
      component.writeValue(undefined);
      expect(component.content).toBe('');
    });

    it('should register onChange callback', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      
      component.registerOnChange(mockOnChange);
      
      editorElement.innerHTML = '<p>Changed content</p>';
      editorElement.dispatchEvent(new Event('input'));
      
      expect(mockOnChange).toHaveBeenCalledWith('<p>Changed content</p>');
    });

    it('should register onTouched callback', () => {
      const mockOnTouched = jasmine.createSpy('onTouched');
      
      component.registerOnTouched(mockOnTouched);
      
      editorElement.dispatchEvent(new Event('focus'));
      
      expect(mockOnTouched).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(editorElement.contentEditable).toBe('false');
      
      component.setDisabledState(false);
      expect(editorElement.contentEditable).toBe('true');
    });
  });

  describe('Event Handling', () => {
    it('should handle paste events and strip formatting', () => {
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer()
      });
      
      // Mock clipboard data
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          getData: jasmine.createSpy('getData').and.returnValue('Plain text content')
        }
      });
      
      spyOn(pasteEvent, 'preventDefault');
      spyOn(document, 'execCommand');
      
      editorElement.dispatchEvent(pasteEvent);
      
      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'Plain text content');
    });

    it('should handle input events', () => {
      spyOn(component, 'updateContent' as any);
      
      editorElement.dispatchEvent(new Event('input'));
      
      expect(component['updateContent']).toHaveBeenCalled();
    });

    it('should handle focus events', () => {
      const mockOnTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(mockOnTouched);
      
      editorElement.dispatchEvent(new Event('focus'));
      
      expect(mockOnTouched).toHaveBeenCalled();
    });
  });

  describe('Content Sanitization', () => {
    it('should remove script tags', () => {
      const maliciousContent = '<p>Safe content</p><script>alert("xss")</script>';
      
      const sanitized = component.sanitizeContent(maliciousContent);
      
      expect(sanitized).toBe('<p>Safe content</p>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove iframe tags', () => {
      const maliciousContent = '<p>Safe content</p><iframe src="evil.com"></iframe>';
      
      const sanitized = component.sanitizeContent(maliciousContent);
      
      expect(sanitized).toBe('<p>Safe content</p>');
      expect(sanitized).not.toContain('<iframe>');
    });

    it('should remove javascript: protocols', () => {
      const maliciousContent = '<a href="javascript:alert(\'xss\')">Link</a>';
      
      const sanitized = component.sanitizeContent(maliciousContent);
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const maliciousContent = '<div onclick="alert(\'xss\')" onmouseover="evil()">Content</div>';
      
      const sanitized = component.sanitizeContent(maliciousContent);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onmouseover');
    });

    it('should preserve safe HTML', () => {
      const safeContent = '<p><strong>Bold</strong> and <em>italic</em> text with <a href="https://example.com">link</a></p>';
      
      const sanitized = component.sanitizeContent(safeContent);
      
      expect(sanitized).toBe(safeContent);
    });
  });

  describe('Template Integration', () => {
    it('should display toolbar buttons', () => {
      const toolbar = fixture.nativeElement.querySelector('.editor-toolbar');
      expect(toolbar).toBeTruthy();
      
      const boldButton = fixture.nativeElement.querySelector('button[title*="Bold"]');
      expect(boldButton).toBeTruthy();
      
      const italicButton = fixture.nativeElement.querySelector('button[title*="Italic"]');
      expect(italicButton).toBeTruthy();
    });

    it('should display character count', () => {
      component.characterCount = 50;
      component.maxLength = 100;
      fixture.detectChanges();
      
      const characterCounter = fixture.nativeElement.querySelector('.character-counter');
      expect(characterCounter).toBeTruthy();
      expect(characterCounter.textContent).toContain('50');
      expect(characterCounter.textContent).toContain('100');
    });

    it('should show warning when character limit exceeded', () => {
      component.characterCount = 150;
      component.maxLength = 100;
      fixture.detectChanges();
      
      const characterCounter = fixture.nativeElement.querySelector('.character-counter');
      expect(characterCounter.classList.contains('exceeded')).toBe(true);
    });

    it('should toggle between editor and preview modes', () => {
      const editorDiv = fixture.nativeElement.querySelector('.editor-content');
      expect(editorDiv).toBeTruthy();
      
      component.isPreviewMode = true;
      fixture.detectChanges();
      
      const previewDiv = fixture.nativeElement.querySelector('.preview-content');
      expect(previewDiv).toBeTruthy();
    });

    it('should trigger formatting commands from toolbar', () => {
      spyOn(component, 'toggleBold');
      
      const boldButton = fixture.nativeElement.querySelector('button[title*="Bold"]');
      boldButton.click();
      
      expect(component.toggleBold).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup editor and auto-save on init', () => {
      spyOn(component, 'setupEditor' as any);
      spyOn(component, 'setupAutoSave' as any);
      
      component.ngOnInit();
      
      expect(component['setupEditor']).toHaveBeenCalled();
      expect(component['setupAutoSave']).toHaveBeenCalled();
    });

    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should cleanup event listeners on destroy', () => {
      const removeEventListenerSpy = spyOn(editorElement, 'removeEventListener');
      
      component.ngOnDestroy();
      
      // The component should clean up properly
      expect(component['destroy$'].closed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing clipboard data gracefully', () => {
      const pasteEvent = new ClipboardEvent('paste');
      
      expect(() => {
        editorElement.dispatchEvent(pasteEvent);
      }).not.toThrow();
    });

    it('should handle execCommand failures gracefully', () => {
      spyOn(document, 'execCommand').and.throwError('Command failed');
      
      expect(() => {
        component.toggleBold();
      }).not.toThrow();
    });

    it('should handle missing editor element', () => {
      component.editorRef = undefined as any;
      
      expect(() => {
        component.writeValue('test');
        component.setDisabledState(true);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on toolbar buttons', () => {
      const boldButton = fixture.nativeElement.querySelector('button[title*="Bold"]');
      expect(boldButton.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have proper role on editor element', () => {
      expect(editorElement.getAttribute('role')).toBe('textbox');
    });

    it('should support keyboard navigation', () => {
      const toolbar = fixture.nativeElement.querySelector('.editor-toolbar');
      const buttons = toolbar.querySelectorAll('button');
      
      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });
});