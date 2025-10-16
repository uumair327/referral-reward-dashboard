export interface ReferralOffer {
  id: string;
  title: string;
  description: string;
  referralLink: string;
  referralCode?: string;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  clickCount?: number;
  conversionCount?: number;
  cashbackAmount?: number;
  validUntil?: Date;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface CreateReferralOfferRequest {
  title: string;
  description: string;
  referralLink: string;
  referralCode?: string;
  categoryId: string;
}

export interface UpdateReferralOfferRequest extends Partial<CreateReferralOfferRequest> {
  id: string;
  isActive?: boolean;
}