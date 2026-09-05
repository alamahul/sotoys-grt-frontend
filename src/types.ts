// Database Schemas (TypeScript Interfaces representing MongoDB/SQL documents)

export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariationOption {
  name: string;
  image: string | null;
}

export interface Variation {
  variation_type: string;
  variation_options: VariationOption[];
}

export interface Review {
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight?: number;
  condition?: string;
  categoryId: string;
  category?: Category;
  rating: number;
  reviews?: Review[];
  images: string[];
  variations?: Variation[];
  status?: 'draft' | 'published' | 'non-published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  courier: string;
  shippingCost: number;
  trackingNumber?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Promo {
  id: string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  maxUses: number;
  usesCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface OtpLog {
  id: string;
  userId: string;
  otpCode: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'SHIPPED_BY_CUSTOMER' | 'RECEIVED' | 'REPLACEMENT_SHIPPED' | 'REFUNDED' | 'COMPLETED' | 'REJECTED';

export interface ReturnTimelineEvent {
  id: number;
  date: string;
  status: string;
  description: string;
  isCompleted: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  productId?: string | null;
  productName?: string | null;
  reason: string;
  details?: string | null;
  contactInfo: string;
  proofImages: string[];
  videoUrl?: string | null;
  status: ReturnStatus;
  faultType?: string;
  solutionType?: 'REPLACEMENT' | 'REFUND' | string;
  preferredSolution?: 'REPLACEMENT' | 'REFUND' | string;
  shippingFeeBearer?: 'SELLER' | 'BUYER' | string;
  returnShippingCost?: number;
  replacementCourier?: string | null;
  replacementTrackingNumber?: string | null;
  replacementShippedAt?: string | Date | null;
  refundAmount: number;
  refundMethod?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  adminNotes?: string | null;
  returnCourier?: string | null;
  returnTrackingNumber?: string | null;
  order?: any;
  product?: any;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}
