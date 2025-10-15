import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReferralCardComponent } from './referral-card.component';
import { ReferralOffer, Category } from '../../../../models';

describe('ReferralCardComponent', () => {
  let component: ReferralCardComponent;
  let fixture: ComponentFixture<ReferralCardComponent>;

  const mockOffer: ReferralOffer = {
    id: 'offer1',
    title: 'Test Offer',
    description: 'This is a test offer description that might be quite long to test truncation and display.',
    referralLink: 'https://example.com/referral',
    referralCode: 'TEST123',
    categoryId: 'cat1',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-06-15'),
    clickCount: 42
  };

  const mockCategory: Category = {
    id: 'cat1',
    name: 'Test Category',
    icon: 'account_balance',
    description: 'Test Category Description',
    isActive: true,
    offerCount: 5,
    displayOrder: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReferralCardComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferralCardComponent);
    component = fixture.componentInstance;
    component.offer = mockOffer;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should require offer input', () => {
      expect(component.offer).toBeDefined();
      expect(component.offer).toEqual(mockOffer);
    });

    it('should have default input values', () => {
      expect(component.showCategory).toBe(false);
      expect(component.compact).toBe(false);
      expect(component.category).toBeUndefined();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display offer title', () => {
      const titleElement = fixture.nativeElement.querySelector('mat-card-title');
      expect(titleElement.textContent.trim()).toBe('Test Offer');
    });

    it('should display offer description', () => {
      const descriptionElement = fixture.nativeElement.querySelector('mat-card-content p');
      expect(descriptionElement.textContent.trim()).toContain('This is a test offer description');
    });

    it('should display referral code when available', () => {
      const codeChip = fixture.nativeElement.querySelector('mat-chip');
      expect(codeChip.textContent.trim()).toContain('TEST123');
    });

    it('should display click count', () => {
      const clickCount = fixture.nativeElement.querySelector('.click-count');
      expect(clickCount.textContent.trim()).toContain('42');
    });

    it('should display formatted date', () => {
      const dateElement = fixture.nativeElement.querySelector('.offer-date');
      expect(dateElement.textContent.trim()).toContain('Jun 15, 2023');
    });

    it('should have clickable card', () => {
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.getAttribute('tabindex')).toBe('0');
      expect(card.getAttribute('role')).toBe('button');
    });
  });

  describe('Referral Code Display', () => {
    it('should show referral code chip when code exists', () => {
      fixture.detectChanges();
      
      const codeChip = fixture.nativeElement.querySelector('mat-chip');
      expect(codeChip).toBeTruthy();
      expect(codeChip.textContent.trim()).toContain('TEST123');
    });

    it('should hide referral code chip when code is null', () => {
      component.offer = { ...mockOffer, referralCode: undefined };
      fixture.detectChanges();
      
      const codeChip = fixture.nativeElement.querySelector('mat-chip');
      expect(codeChip).toBeFalsy();
    });

    it('should show copy button when referral code exists', () => {
      fixture.detectChanges();
      
      const copyButton = fixture.nativeElement.querySelector('button[aria-label*="Copy"]');
      expect(copyButton).toBeTruthy();
    });
  });

  describe('Category Display', () => {
    it('should show category when showCategory is true and category is provided', () => {
      component.showCategory = true;
      component.category = mockCategory;
      fixture.detectChanges();
      
      const categoryElement = fixture.nativeElement.querySelector('.category-info');
      expect(categoryElement).toBeTruthy();
      expect(categoryElement.textContent.trim()).toContain('Test Category');
    });

    it('should hide category when showCategory is false', () => {
      component.showCategory = false;
      component.category = mockCategory;
      fixture.detectChanges();
      
      const categoryElement = fixture.nativeElement.querySelector('.category-info');
      expect(categoryElement).toBeFalsy();
    });

    it('should hide category when category is not provided', () => {
      component.showCategory = true;
      component.category = undefined;
      fixture.detectChanges();
      
      const categoryElement = fixture.nativeElement.querySelector('.category-info');
      expect(categoryElement).toBeFalsy();
    });
  });

  describe('Compact Mode', () => {
    it('should apply compact class when compact is true', () => {
      component.compact = true;
      fixture.detectChanges();
      
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.classList.contains('compact')).toBe(true);
    });

    it('should not apply compact class when compact is false', () => {
      component.compact = false;
      fixture.detectChanges();
      
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.classList.contains('compact')).toBe(false);
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit offerClick when card is clicked', () => {
      spyOn(component.offerClick, 'emit');
      
      component.onOfferClick();
      
      expect(component.offerClick.emit).toHaveBeenCalledWith(mockOffer);
    });

    it('should emit offerClick when card is clicked in template', () => {
      spyOn(component.offerClick, 'emit');
      
      const card = fixture.nativeElement.querySelector('mat-card');
      card.click();
      
      expect(component.offerClick.emit).toHaveBeenCalledWith(mockOffer);
    });

    it('should copy referral code to clipboard when copy button is clicked', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      spyOn(component.copyCode, 'emit');
      
      const copyButton = fixture.nativeElement.querySelector('button[aria-label*="Copy"]');
      copyButton.click();
      
      await fixture.whenStable();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TEST123');
      expect(component.copyCode.emit).toHaveBeenCalledWith('TEST123');
    });

    it('should stop event propagation when copy button is clicked', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      
      component.onCopyCode(event);
      
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle clipboard write errors gracefully', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');
      
      const event = new Event('click');
      component.onCopyCode(event);
      
      await fixture.whenStable();
      
      expect(console.error).toHaveBeenCalledWith('Failed to copy code:', 'Error');
    });
  });

  describe('Keyboard Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should trigger onOfferClick when Enter key is pressed', () => {
      spyOn(component, 'onOfferClick');
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(enterEvent, 'preventDefault');
      
      component.onKeyDown(enterEvent);
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(component.onOfferClick).toHaveBeenCalled();
    });

    it('should trigger onOfferClick when Space key is pressed', () => {
      spyOn(component, 'onOfferClick');
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(spaceEvent, 'preventDefault');
      
      component.onKeyDown(spaceEvent);
      
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
      expect(component.onOfferClick).toHaveBeenCalled();
    });

    it('should not trigger onOfferClick for other keys', () => {
      spyOn(component, 'onOfferClick');
      
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      component.onKeyDown(tabEvent);
      
      expect(component.onOfferClick).not.toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    describe('formatClickCount', () => {
      it('should format numbers less than 1000 as is', () => {
        expect(component.formatClickCount(42)).toBe('42');
        expect(component.formatClickCount(999)).toBe('999');
      });

      it('should format numbers 1000 and above with k suffix', () => {
        expect(component.formatClickCount(1000)).toBe('1.0k');
        expect(component.formatClickCount(1500)).toBe('1.5k');
        expect(component.formatClickCount(2300)).toBe('2.3k');
      });

      it('should handle zero and negative numbers', () => {
        expect(component.formatClickCount(0)).toBe('0');
        expect(component.formatClickCount(-5)).toBe('-5');
      });
    });

    describe('getFormattedDate', () => {
      it('should format date correctly', () => {
        const date = new Date('2023-06-15');
        const formatted = component.getFormattedDate(date);
        
        expect(formatted).toBe('Jun 15, 2023');
      });

      it('should handle different dates', () => {
        const date1 = new Date('2023-01-01');
        const date2 = new Date('2023-12-31');
        
        expect(component.getFormattedDate(date1)).toBe('Jan 1, 2023');
        expect(component.getFormattedDate(date2)).toBe('Dec 31, 2023');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels', () => {
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('aria-label')).toContain('Test Offer');
    });

    it('should be keyboard focusable', () => {
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.getAttribute('tabindex')).toBe('0');
    });

    it('should have proper button labels', () => {
      const copyButton = fixture.nativeElement.querySelector('button[aria-label*="Copy"]');
      expect(copyButton.getAttribute('aria-label')).toContain('Copy referral code');
    });
  });

  describe('Edge Cases', () => {
    it('should handle offer without referral code', () => {
      component.offer = { ...mockOffer, referralCode: undefined };
      fixture.detectChanges();
      
      expect(() => {
        const event = new Event('click');
        component.onCopyCode(event);
      }).not.toThrow();
    });

    it('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(500);
      component.offer = { ...mockOffer, description: longDescription };
      fixture.detectChanges();
      
      const descriptionElement = fixture.nativeElement.querySelector('mat-card-content p');
      expect(descriptionElement).toBeTruthy();
    });

    it('should handle zero click count', () => {
      component.offer = { ...mockOffer, clickCount: 0 };
      fixture.detectChanges();
      
      const clickCount = fixture.nativeElement.querySelector('.click-count');
      expect(clickCount.textContent.trim()).toContain('0');
    });

    it('should handle undefined click count', () => {
      component.offer = { ...mockOffer, clickCount: undefined };
      fixture.detectChanges();
      
      const clickCount = fixture.nativeElement.querySelector('.click-count');
      expect(clickCount.textContent.trim()).toContain('0');
    });
  });

  describe('Event Emissions', () => {
    it('should emit correct offer on click', () => {
      spyOn(component.offerClick, 'emit');
      
      component.onOfferClick();
      
      expect(component.offerClick.emit).toHaveBeenCalledWith(mockOffer);
      expect(component.offerClick.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit correct referral code on copy', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      spyOn(component.copyCode, 'emit');
      
      const event = new Event('click');
      component.onCopyCode(event);
      
      await fixture.whenStable();
      
      expect(component.copyCode.emit).toHaveBeenCalledWith('TEST123');
      expect(component.copyCode.emit).toHaveBeenCalledTimes(1);
    });
  });
});