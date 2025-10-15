import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlSanitizerService {

  /**
   * Sanitize HTML content for safe display
   */
  sanitize(html: string): string {
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
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    // Clean up empty HTML tags and excessive whitespace
    sanitized = sanitized
      .replace(/<div>\s*<\/div>/gi, '') // Remove empty divs
      .replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
      .replace(/<span>\s*<\/span>/gi, '') // Remove empty spans
      .replace(/<br>\s*<br>/gi, '<br>') // Remove duplicate line breaks
      .replace(/(<br>\s*){3,}/gi, '<br><br>') // Limit consecutive line breaks
      .replace(/^\s*(<br>\s*)+/gi, '') // Remove leading line breaks
      .replace(/(<br>\s*)+\s*$/gi, '') // Remove trailing line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return sanitized;
  }

  /**
   * Convert HTML to plain text
   */
  toPlainText(html: string): string {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.sanitize(html);
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Clean up malformed HTML content
   */
  cleanupMalformedHtml(html: string): string {
    if (!html) return '';
    
    let cleaned = html;
    
    // Fix common malformed patterns
    cleaned = cleaned
      // Fix unclosed tags
      .replace(/<br>(?!<\/br>)/gi, '<br/>')
      // Remove redundant closing tags without opening tags
      .replace(/<\/div>(?![^<]*<div[^>]*>)/gi, '')
      .replace(/<\/p>(?![^<]*<p[^>]*>)/gi, '')
      // Fix nested empty tags
      .replace(/<(\w+)>\s*<\/\1>/gi, '')
      // Remove HTML entities that shouldn't be there
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    return this.sanitize(cleaned);
  }

  /**
   * Check if content contains HTML tags
   */
  containsHtml(content: string): boolean {
    if (!content) return false;
    return /<[^>]+>/.test(content);
  }

  /**
   * Escape HTML for safe display as text
   */
  escapeHtml(text: string): string {
    if (!text) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.textContent = text;
    return tempDiv.innerHTML;
  }
}