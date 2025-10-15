import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ReferralOffer, Category } from '../../../../models';
import { HtmlSanitizerService } from '../../../../services/html-sanitizer.service';

@Component({
  selector: 'app-referral-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './referral-card.component.html',
  styleUrl: './referral-card.component.scss'
})
export class ReferralCardComponent {
  @Input({ required: true }) offer!: ReferralOffer;
  @Input() category?: Category;
  @Input() showCategory = false;
  @Input() compact = false;

  @Output() offerClick = new EventEmitter<ReferralOffer>();
  @Output() copyCode = new EventEmitter<string>();

  constructor(private htmlSanitizer: HtmlSanitizerService) {}

  onOfferClick(): void {
    this.offerClick.emit(this.offer);
  }

  onGetOfferClick(event: Event): void {
    event.stopPropagation(); // Prevent card click from firing
    this.offerClick.emit(this.offer);
  }

  onCopyCode(event: Event): void {
    event.stopPropagation();
    if (this.offer.referralCode) {
      navigator.clipboard.writeText(this.offer.referralCode).then(() => {
        this.copyCode.emit(this.offer.referralCode!);
      }).catch(err => {
        console.error('Failed to copy code:', err);
      });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onOfferClick();
    }
  }

  formatClickCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  getFormattedDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  getSanitizedDescription(description: string): string {
    return this.htmlSanitizer.sanitize(description);
  }
}