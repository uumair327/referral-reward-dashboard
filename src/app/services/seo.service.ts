import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private readonly baseUrl = 'https://uumair327.github.io/referral-reward-dashboard';
  private readonly defaultImage = `${this.baseUrl}/assets/og-image.png`;

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {
    this.initializeRouteTracking();
  }

  private initializeRouteTracking(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateSEOForRoute(event.url);
    });
  }

  private updateSEOForRoute(url: string): void {
    // Update SEO based on current route
    if (url === '/') {
      this.updateHomepageSEO();
    } else if (url.startsWith('/category/')) {
      const categoryId = url.split('/')[2];
      this.updateCategorySEO(categoryId);
    } else if (url.startsWith('/admin')) {
      this.updateAdminSEO();
    } else if (url === '/404') {
      this.update404SEO();
    }
  }

  updateSEO(data: SEOData): void {
    // Update title
    if (data.title) {
      this.title.setTitle(data.title);
      this.meta.updateTag({ property: 'og:title', content: data.title });
      this.meta.updateTag({ name: 'twitter:title', content: data.title });
    }

    // Update description
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }

    // Update keywords
    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    // Update image
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }

    // Update URL
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
      this.meta.updateTag({ name: 'twitter:url', content: data.url });
      this.meta.updateTag({ rel: 'canonical', href: data.url });
    }

    // Update type
    if (data.type) {
      this.meta.updateTag({ property: 'og:type', content: data.type });
    }

    // Update author
    if (data.author) {
      this.meta.updateTag({ name: 'author', content: data.author });
    }

    // Update published time
    if (data.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: data.publishedTime });
    }

    // Update modified time
    if (data.modifiedTime) {
      this.meta.updateTag({ property: 'article:modified_time', content: data.modifiedTime });
    }
  }

  private updateHomepageSEO(): void {
    this.updateSEO({
      title: 'Best Referral Offers & Rewards Dashboard - Earn Cashback & Bonuses',
      description: 'Find the best referral offers, cashback deals, and reward programs. Browse demat accounts, medical apps, hotels, entertainment, and online shopping referrals. Start earning today!',
      keywords: 'referral offers, cashback, rewards, referral codes, demat account referral, medical app offers, hotel booking cashback, entertainment deals, online shopping rewards',
      url: this.baseUrl,
      type: 'website',
      image: this.defaultImage
    });
  }

  private updateCategorySEO(categoryId: string): void {
    const categoryData = this.getCategoryData(categoryId);
    this.updateSEO({
      title: `${categoryData.name} Referral Offers & Cashback Deals - Rewards Dashboard`,
      description: `Discover the best ${categoryData.name.toLowerCase()} referral offers and cashback deals. ${categoryData.description} Find exclusive bonus codes and start earning rewards today!`,
      keywords: `${categoryData.name.toLowerCase()} referral, ${categoryData.keywords}, cashback, bonus codes, rewards, offers`,
      url: `${this.baseUrl}/category/${categoryId}`,
      type: 'website',
      image: this.defaultImage
    });
  }

  private updateAdminSEO(): void {
    this.updateSEO({
      title: 'Admin Dashboard - Referral & Rewards Management',
      description: 'Admin panel for managing referral offers, categories, and reward programs. Secure access required.',
      keywords: 'admin, dashboard, management, referral management',
      url: `${this.baseUrl}/admin`,
      type: 'website',
      image: this.defaultImage
    });
  }

  private update404SEO(): void {
    this.updateSEO({
      title: 'Page Not Found - Referral & Rewards Dashboard',
      description: 'The page you are looking for could not be found. Browse our referral offers and reward programs.',
      keywords: 'page not found, 404, referral offers, rewards',
      url: `${this.baseUrl}/404`,
      type: 'website',
      image: this.defaultImage
    });
  }

  private getCategoryData(categoryId: string): { name: string; description: string; keywords: string } {
    const categories = {
      'demat-account': {
        name: 'Demat Account',
        description: 'Open free demat accounts and earn cashback on stock trading and investment platforms.',
        keywords: 'demat account, stock trading, investment, share market, trading account, brokerage'
      },
      'medical-app': {
        name: 'Medical Apps',
        description: 'Get cashback on healthcare apps, telemedicine, and medical service platforms.',
        keywords: 'medical apps, healthcare, telemedicine, doctor consultation, health services'
      },
      'hospitality-hotel': {
        name: 'Hotels & Travel',
        description: 'Book hotels and travel services with exclusive cashback and referral bonuses.',
        keywords: 'hotel booking, travel, accommodation, vacation, hospitality, travel deals'
      },
      'entertainment': {
        name: 'Entertainment',
        description: 'Stream movies, music, and entertainment with cashback offers and referral rewards.',
        keywords: 'entertainment, streaming, movies, music, OTT platforms, subscription deals'
      },
      'online-products': {
        name: 'Online Shopping',
        description: 'Shop online with cashback offers from Amazon, Flipkart, and other e-commerce platforms.',
        keywords: 'online shopping, e-commerce, Amazon, Flipkart, cashback, shopping deals'
      }
    };

    return categories[categoryId as keyof typeof categories] || {
      name: 'Category',
      description: 'Browse referral offers and cashback deals in this category.',
      keywords: 'referral offers, cashback, rewards'
    };
  }

  // Method to add structured data (JSON-LD)
  addStructuredData(data: any): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Add organization structured data
  addOrganizationStructuredData(): void {
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Referral & Rewards Dashboard",
      "url": this.baseUrl,
      "logo": `${this.baseUrl}/assets/icons/icon-192x192.png`,
      "description": "Find the best referral offers, cashback deals, and reward programs across multiple platforms.",
      "sameAs": [
        // Add social media links when available
      ]
    };
    this.addStructuredData(organizationData);
  }

  // Add website structured data
  addWebsiteStructuredData(): void {
    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Referral & Rewards Dashboard",
      "url": this.baseUrl,
      "description": "Find the best referral offers, cashback deals, and reward programs across multiple platforms.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.baseUrl}/category/{search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
    this.addStructuredData(websiteData);
  }

  // Add breadcrumb structured data
  addBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>): void {
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
    this.addStructuredData(breadcrumbData);
  }

  // Add FAQ structured data for categories
  addCategoryFAQStructuredData(categoryName: string): void {
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What are ${categoryName.toLowerCase()} referral offers?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${categoryName} referral offers are special deals where you can earn cashback, bonuses, or rewards by signing up for services through referral links. These offers provide mutual benefits for both the referrer and the new user.`
          }
        },
        {
          "@type": "Question",
          "name": `How do ${categoryName.toLowerCase()} referral codes work?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `When you use a referral code for ${categoryName.toLowerCase()} services, you typically receive a bonus or cashback after completing specific actions like making your first purchase, deposit, or subscription. The person who shared the code also receives a reward.`
          }
        },
        {
          "@type": "Question",
          "name": `Are ${categoryName.toLowerCase()} referral offers safe?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes, all ${categoryName.toLowerCase()} referral offers listed on our platform are from legitimate, well-known companies. We verify each offer before listing to ensure they are genuine and safe to use.`
          }
        }
      ]
    };
    this.addStructuredData(faqData);
  }
}