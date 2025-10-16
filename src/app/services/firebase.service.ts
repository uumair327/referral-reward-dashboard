import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category, ReferralOffer } from '../models';
import { firebaseConfig, FIREBASE_ENABLED } from '../config/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: any;
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private offersSubject = new BehaviorSubject<ReferralOffer[]>([]);
  private isFirebaseEnabled = FIREBASE_ENABLED;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (!this.isFirebaseEnabled) {
      console.log('📱 Firebase disabled, using localStorage');
      this.loadFromLocalStorage();
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      this.setupRealtimeListeners();
      console.log('🔥 Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      // Fallback to localStorage if Firebase fails
      this.loadFromLocalStorage();
    }
  }

  private setupRealtimeListeners(): void {
    // Real-time categories listener
    const categoriesQuery = query(
      collection(this.db, 'categories'),
      orderBy('displayOrder')
    );
    
    onSnapshot(categoriesQuery, (snapshot) => {
      const categories: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date()
        } as Category);
      });
      this.categoriesSubject.next(categories);
      console.log('📡 Categories updated from Firebase:', categories.length);
    });

    // Real-time offers listener
    const offersQuery = query(
      collection(this.db, 'offers'),
      orderBy('createdAt', 'desc')
    );
    
    onSnapshot(offersQuery, (snapshot) => {
      const offers: ReferralOffer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date()
        } as ReferralOffer);
      });
      this.offersSubject.next(offers);
      console.log('📡 Offers updated from Firebase:', offers.length);
    });
  }

  private loadFromLocalStorage(): void {
    // Fallback to localStorage if Firebase is not available
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const offers = JSON.parse(localStorage.getItem('referralOffers') || '[]');
    
    this.categoriesSubject.next(categories);
    this.offersSubject.next(offers);
    console.log('📱 Loaded data from localStorage as fallback');
  }

  // Categories methods
  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<void> {
    try {
      const categoryData = {
        ...category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = doc(collection(this.db, 'categories'));
      await setDoc(docRef, categoryData);
      console.log('✅ Category added to Firebase:', category.name);
    } catch (error) {
      console.error('❌ Error adding category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      const categoryRef = doc(this.db, 'categories', id);
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Category updated in Firebase:', id);
    } catch (error) {
      console.error('❌ Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'categories', id));
      console.log('✅ Category deleted from Firebase:', id);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  }

  // Offers methods
  getOffers(): Observable<ReferralOffer[]> {
    return this.offersSubject.asObservable();
  }

  async addOffer(offer: Omit<ReferralOffer, 'id'>): Promise<void> {
    try {
      const offerData = {
        ...offer,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        clickCount: 0
      };
      
      const docRef = doc(collection(this.db, 'offers'));
      await setDoc(docRef, offerData);
      console.log('✅ Offer added to Firebase:', offer.title);
    } catch (error) {
      console.error('❌ Error adding offer:', error);
      throw error;
    }
  }

  async updateOffer(id: string, updates: Partial<ReferralOffer>): Promise<void> {
    try {
      const offerRef = doc(this.db, 'offers', id);
      await updateDoc(offerRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Offer updated in Firebase:', id);
    } catch (error) {
      console.error('❌ Error updating offer:', error);
      throw error;
    }
  }

  async deleteOffer(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'offers', id));
      console.log('✅ Offer deleted from Firebase:', id);
    } catch (error) {
      console.error('❌ Error deleting offer:', error);
      throw error;
    }
  }

  async incrementClickCount(offerId: string): Promise<void> {
    try {
      const offers = this.offersSubject.value;
      const offer = offers.find(o => o.id === offerId);
      if (offer) {
        await this.updateOffer(offerId, { 
          clickCount: (offer.clickCount || 0) + 1 
        });
      }
    } catch (error) {
      console.error('❌ Error incrementing click count:', error);
    }
  }

  // Initialize with default data if collections are empty
  async initializeDefaultData(): Promise<void> {
    try {
      const categoriesSnapshot = await getDocs(collection(this.db, 'categories'));
      const offersSnapshot = await getDocs(collection(this.db, 'offers'));

      if (categoriesSnapshot.empty) {
        console.log('🔄 Initializing default categories...');
        await this.loadDefaultCategories();
      }

      if (offersSnapshot.empty) {
        console.log('🔄 Initializing default offers...');
        await this.loadDefaultOffers();
      }
    } catch (error) {
      console.error('❌ Error initializing default data:', error);
    }
  }

  private async loadDefaultCategories(): Promise<void> {
    const defaultCategories: Omit<Category, 'id'>[] = [
      {
        name: 'E-commerce',
        icon: '🛒',
        description: 'Online shopping platforms and marketplaces',
        isActive: true,
        displayOrder: 1,
        offerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Food & Dining',
        icon: '🍕',
        description: 'Food delivery and restaurant services',
        isActive: true,
        displayOrder: 2,
        offerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Travel',
        icon: '✈️',
        description: 'Travel booking and accommodation services',
        isActive: true,
        displayOrder: 3,
        offerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Finance',
        icon: '💳',
        description: 'Banking, credit cards, and financial services',
        isActive: true,
        displayOrder: 4,
        offerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const category of defaultCategories) {
      await this.addCategory(category);
    }
  }

  private async loadDefaultOffers(): Promise<void> {
    const defaultOffers: Omit<ReferralOffer, 'id'>[] = [
      {
        title: 'Amazon Prime Membership',
        description: 'Get exclusive deals and free shipping with Amazon Prime',
        categoryId: 'ecommerce',
        referralLink: 'https://amazon.in/prime',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        clickCount: 0,
        cashbackAmount: 500,
        isFeatured: true
      },
      {
        title: 'Swiggy Food Delivery',
        description: 'Order food online and get cashback on every order',
        categoryId: 'food',
        referralLink: 'https://swiggy.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        clickCount: 0,
        cashbackAmount: 10,
        isFeatured: false
      }
    ];

    for (const offer of defaultOffers) {
      await this.addOffer(offer);
    }
  }
}