export interface AdminSettings {
  storeName: string;
  adminWA: string; // WhatsApp number in international format e.g., 628xxx
  qrisImage: string; // Base64 or URL
  qrisText: string; // QRIS text code if available
  danaNumber: string;
  danaName: string;
  gopayNumber: string;
  gopayName: string;
  adminFee: number; // Flat admin fee in Rupiah (default: 2500)
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string; // URL or Base64 data URI
  description: string;
}

export type PaymentMethod = 'qris' | 'dana' | 'gopay' | 'chat';

export interface CheckoutState {
  product: Product;
  quantity: number;
  adminFee: number;
  totalAmount: number;
  step: 'none' | 'quantity' | 'loading_payment' | 'select_payment' | 'loading_final' | 'final_payment';
  paymentMethod?: PaymentMethod;
}
