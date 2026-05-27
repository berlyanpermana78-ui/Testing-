import React, { useState } from 'react';
import { 
  ShoppingBag, Plus, Minus, ArrowRight, Loader2, Copy, 
  Check, ChevronLeft, ArrowLeft, MessageSquare, AlertCircle, 
  ExternalLink, QrCode, PhoneCall, CheckCircle2, Send, Search, Sparkles
} from 'lucide-react';
import { Product, AdminSettings, PaymentMethod, CheckoutState } from '../types';

interface StoreFrontProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  settings: AdminSettings;
  onOpenAdmin: () => void;
}

export default function StoreFront({
  products,
  setProducts,
  settings,
  onOpenAdmin
}: StoreFrontProps) {
  // Navigation & search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Checkout state management
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);
  
  // Custom states for interactive elements
  const [copiedText, setCopiedText] = useState<'copylink' | 'dana' | 'gopay' | null>(null);
  const [loadingText, setLoadingText] = useState('');

  // Handle Clipboard Copy
  const handleCopy = (text: string, type: 'dana' | 'gopay' | 'copylink') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trigger Purchase Modal Start
  const triggerBuyProduct = (p: Product) => {
    if (p.stock <= 0) return;
    setCheckout({
      product: p,
      quantity: 1,
      adminFee: settings.adminFee,
      totalAmount: p.price + settings.adminFee,
      step: 'quantity'
    });
  };

  // Adjust product buying quantity
  const handleQtyChange = (val: number) => {
    if (!checkout) return;
    const nextQty = checkout.quantity + val;
    if (nextQty < 1 || nextQty > checkout.product.stock) return;

    const baseAmount = checkout.product.price * nextQty;
    setCheckout({
      ...checkout,
      quantity: nextQty,
      totalAmount: baseAmount + checkout.adminFee
    });
  };

  // Step 1: Proceed from quantity screen -> shows payment selection screen via loading screen
  const proceedToPaymentLoading = () => {
    if (!checkout) return;
    
    setCheckout(prev => prev ? { ...prev, step: 'loading_payment' } : null);
    setLoadingText('Mempersiapkan opsi pembayaran aman...');

    setTimeout(() => {
      setCheckout(prev => prev ? { ...prev, step: 'select_payment' } : null);
    }, 1500);
  };

  // Step 2: Select a payment method, triggers a second elegant loading sequence
  const selectPaymentMethod = (method: PaymentMethod) => {
    if (!checkout) return;

    setCheckout(prev => prev ? { 
      ...prev, 
      paymentMethod: method, 
      step: 'loading_final' 
    } : null);
    
    setLoadingText('Sistem sedang mengamankan referensi pembayaran...');

    setTimeout(() => {
      setCheckout(prev => prev ? { ...prev, step: 'final_payment' } : null);
    }, 1200);
  };

  // Action function to generate WhatsApp direct prefilled text and complete purchase
  const buildWhatsAppLinkAndFinish = () => {
    if (!checkout || !checkout.paymentMethod) return '';

    const { product, quantity, adminFee, totalAmount, paymentMethod } = checkout;
    
    // Formatting currency
    const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

    const text = `Halo Admin *${settings.storeName}*, saya ingin memesan produk berikut:

🛒 *REKAP TRANSAKSI:*
• Produk: *${product.name}*
• Jumlah: *${quantity}x*
• Harga Satuan: ${formatRp(product.price)}
• Biaya Tambahan: ${formatRp(adminFee)}
━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━
💰 *TOTAL WAJIB BAYAR:* *${formatRp(totalAmount)}*
━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━
💳 *METODE PEMBAYARAN:* *${paymentMethod.toUpperCase()}*

*Status:* Pembayaran Selesai/Segera Dikirim. Berikut adalah bukti pembayaran terlampir.`;

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${settings.adminWA}?text=${encodedText}`;
  };

  // Handle final completion (deduct inventory stock manually in React state & save to LocalStorage)
  const handleCompleteOrder = () => {
    if (!checkout) return;

    // Deduct stock
    const updatedProducts = products.map(p => {
      if (p.id === checkout.product.id) {
        return {
          ...p,
          stock: Math.max(0, p.stock - checkout.quantity)
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem('liquid_products', JSON.stringify(updatedProducts));

    // Clear checkout
    setCheckout(null);
    setSelectedProduct(null);

    // Notify user
    alert('Konfirmasi pesanan terkirim! Silakan teruskan pesan otomatis ke WhatsApp Admin agar pesanan langsung diproses.');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      
      {/* Brand Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden glass-card flex items-center justify-center border-white/20 select-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-400 opacity-20" />
            <span className="font-display font-extrabold text-white text-md glow-text">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-display uppercase tracking-wider text-white select-none">
              {settings.storeName}
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Liquid Glass Monochrome Store</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={onOpenAdmin}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 transition cursor-pointer flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block animate-ping" />
            Dashboard Admin
          </button>
        </div>
      </header>

      {/* Main Grid: Search & Hero */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari produk impian Anda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-white text-zinc-200"
          />
        </div>
        <div className="text-2xs text-zinc-500 font-mono hidden sm:block">
          SISTEM TRANSAKSI TERINTEGRASI WA ADMIN
        </div>
      </div>

      {/* Products Display Container */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center glass-card rounded-3xl border border-white/5 space-y-4 max-w-lg mx-auto">
          <div className="inline-flex p-4 rounded-full bg-white/5 border border-white/10 text-zinc-400">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-md font-bold text-white font-display">Toko Kosong / Produk Tidak Ditemukan</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Belum ada produk aktif di etalase atau pencarian tidak cocok. Silakan buka <strong>Dashboard Admin</strong> untuk menambahkan produk kustom Anda.
          </p>
          <button
            onClick={onOpenAdmin}
            className="px-5 py-2.5 text-2xs uppercase font-bold tracking-wider rounded-xl bg-white text-black hover:bg-zinc-200 transition cursor-pointer"
          >
            Buka Panel Admin
          </button>
        </div>
      ) : (
        /* Grid of Products */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            return (
              <div 
                key={product.id}
                className="group relative flex flex-col rounded-3xl overflow-hidden glass-card transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Specular premium gradient top glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {/* Image holder */}
                <div 
                  onClick={() => setSelectedProduct(product)}
                  className="w-full aspect-[4/3] relative overflow-hidden bg-zinc-950 cursor-pointer"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                      <span className="text-2xs font-bold tracking-widest uppercase font-mono border border-red-500/30 px-3 py-1 bg-red-950/20 text-red-400 rounded-full">
                        HABIS / OUT OF STOCK
                      </span>
                    </div>
                  )}
                  {/* Glass tint overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                </div>

                {/* Info and Purchase */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 
                        onClick={() => setSelectedProduct(product)}
                        className="text-md font-bold text-white font-display tracking-tight group-hover:text-zinc-200 cursor-pointer transition line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <span className="text-2xs font-mono text-zinc-500 shrink-0">
                        S: {product.stock}
                      </span>
                    </div>
                    <p className="text-2xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase font-mono">Harga Net</span>
                      <span className="font-mono text-xs font-semibold text-zinc-200">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => triggerBuyProduct(product)}
                      className={`px-4 py-2 text-2xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                        isOutOfStock 
                          ? 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed'
                          : 'bg-white hover:bg-zinc-200 text-zinc-950'
                      }`}
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-20 text-center text-2xs text-zinc-600 font-mono border-t border-white/5 pt-8 max-w-lg mx-auto">
        <p>© 2026 {settings.storeName}. All rights reserved.</p>
        <p className="mt-1 text-zinc-500 font-sans">Crafted gracefully in Liquid Glass Monochrome theme with pure client-side persistence.</p>
      </footer>

      {/* MODAL 1: View Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border-white/10">
            <div className="relative aspect-video bg-zinc-950">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer border border-white/10"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-2xs text-zinc-500 uppercase font-mono">Product Details</span>
                <h3 className="text-lg font-bold text-white font-display mt-0.5">{selectedProduct.name}</h3>
                <p className="font-mono text-sm font-semibold text-zinc-300 mt-1">
                  Rp {selectedProduct.price.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{selectedProduct.description}</p>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-2">
                <span className="text-zinc-500">Ketersediaan Stok:</span>
                <span className={selectedProduct.stock > 0 ? 'text-zinc-300' : 'text-red-400 font-bold'}>
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} Unit` : 'Habis'}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  disabled={selectedProduct.stock <= 0}
                  onClick={() => {
                    const p = selectedProduct;
                    setSelectedProduct(null);
                    triggerBuyProduct(p);
                  }}
                  className={`px-5 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider transition cursor-pointer ${
                    selectedProduct.stock <= 0 
                      ? 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
                      : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  Beli
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive Checkout Stepper Flow */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-2xl border-white/10 flex flex-col">
            
            {/* Header flow indicator */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <span className="text-2xs font-bold tracking-widest text-zinc-400 uppercase font-mono">Sistem Pembelian</span>
              {checkout.step !== 'loading_payment' && checkout.step !== 'loading_final' && checkout.step !== 'quantity' && (
                <button 
                  onClick={() => {
                    if (checkout.step === 'select_payment') {
                      setCheckout({ ...checkout, step: 'quantity' });
                    } else if (checkout.step === 'final_payment') {
                      setCheckout({ ...checkout, step: 'select_payment' });
                    }
                  }}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <ChevronLeft size={12} /> Kembali
                </button>
              )}
            </div>

            {/* Steps Container */}
            <div className="p-6 flex-1">
              
              {/* Step A: Quantity adjustment */}
              {checkout.step === 'quantity' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-2xs text-zinc-500 uppercase font-mono">Langkah 1 dari 3</span>
                    <h3 className="text-md font-bold text-white font-display mt-1">Tentukan Jumlah Pembelian</h3>
                  </div>

                  {/* Summary card */}
                  <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                      <img src={checkout.product.image} alt={checkout.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm line-clamp-1">{checkout.product.name}</h4>
                      <p className="text-2xs text-zinc-400 font-mono mt-0.5">@ Rp {checkout.product.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Adjustable count */}
                  <div className="flex justify-center items-center gap-6 py-4">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      disabled={checkout.quantity <= 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white disabled:opacity-20 transition cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-display font-medium text-3xl text-white select-none">{checkout.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(1)}
                      disabled={checkout.quantity >= checkout.product.stock}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white disabled:opacity-20 transition cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price info breakdown */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Harga ({checkout.quantity}x):</span>
                      <span className="text-zinc-300">Rp {(checkout.product.price * checkout.quantity).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Biaya Tambahan Admin:</span>
                      <span className="text-zinc-300">Rp {checkout.adminFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2.5 flex justify-between font-bold text-sm">
                      <span className="text-white">Total Pembayaran:</span>
                      <span className="text-white glow-text">Rp {checkout.totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => setCheckout(null)}
                      className="px-4 py-2.5 text-xs font-semibold rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={proceedToPaymentLoading}
                      className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition font-sans cursor-pointer flex items-center gap-1.5"
                    >
                      Lanjut Pembayaran <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step B: Transitions / Dynamic loading bar */}
              {(checkout.step === 'loading_payment' || checkout.step === 'loading_final') && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10 relative animate-pulse">
                    <Loader2 size={36} className="text-zinc-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">Sedang Memproses...</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">{loadingText}</p>
                  </div>
                </div>
              )}

              {/* Step C: Selection of Payment Methods (QRIS, DANA, GOPAY, CHAT) */}
              {checkout.step === 'select_payment' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-2xs text-zinc-500 uppercase font-mono">Langkah 2 dari 3</span>
                    <h3 className="text-md font-bold text-white font-display mt-0.5">Pilih Metode Pembayaran</h3>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">Total Bayar: Rp {checkout.totalAmount.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* QRIS */}
                    <button
                      onClick={() => selectPaymentMethod('qris')}
                      className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition text-left cursor-pointer flex gap-4 items-center group"
                    >
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 group-hover:text-white transition">
                        <QrCode size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-widest font-mono uppercase">QRIS STANDAR</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Tampilkan Kode QR + Scan Otomatis</p>
                      </div>
                    </button>

                    {/* DANA */}
                    <button
                      onClick={() => selectPaymentMethod('dana')}
                      className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition text-left cursor-pointer flex gap-4 items-center group"
                    >
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 group-hover:text-white transition">
                        <PhoneCall size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-widest font-mono uppercase">DANA INSTANT</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Beli dengan isi pulsa/transfer nomor DANA</p>
                      </div>
                    </button>

                    {/* GOPAY */}
                    <button
                      onClick={() => selectPaymentMethod('gopay')}
                      className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition text-left cursor-pointer flex gap-4 items-center group"
                    >
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 group-hover:text-white transition">
                        <PhoneCall size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-widest font-mono uppercase">GOPAY APPS</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Transfer gopay ke nomor terdaftar</p>
                      </div>
                    </button>

                    {/* CHAT / MANUAL WHATSAPP */}
                    <button
                      onClick={() => selectPaymentMethod('chat')}
                      className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition text-left cursor-pointer flex gap-4 items-center group"
                    >
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 group-hover:text-white transition">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-widest font-mono uppercase">VIA WA CHAT</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Selesaikan & nego langsung lewat WhatsApp</p>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setCheckout({ ...checkout, step: 'quantity' })}
                      className="text-xs font-semibold text-zinc-400 hover:text-white transition pt-2"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Step D: Final details display, instructions, and Auto-WhatsApp trigger link */}
              {checkout.step === 'final_payment' && checkout.paymentMethod && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-2xs text-zinc-400 uppercase font-mono">Invoice Pembayaran</span>
                    <h3 className="text-md font-bold text-white font-display mt-0.5">Selesaikan Pembayaran Anda</h3>
                    <p className="text-2xs text-zinc-500 uppercase mt-1 font-mono">Harap bayar sesuai jumlah tepat di bawah</p>
                  </div>

                  {/* Ultimate exact details */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-1 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-white/25" />
                    <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest block">Total Pembayaran</span>
                    <span className="text-2xl font-mono font-bold text-white glow-text block">
                      Rp {checkout.totalAmount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono block mt-2">
                       (Harga Produk + Admin flat)
                    </span>
                  </div>

                  {/* Payment Info Display Details based on method */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    
                    {checkout.paymentMethod === 'qris' && (
                      <div className="text-center space-y-4">
                        <p className="text-xs text-zinc-300">Scan QRIS di bawah ini dengan OVO, DANA, GoPay, LinkAja atau Apps Bank:</p>
                        
                        <div className="mx-auto w-48 h-48 rounded-2xl border border-white/20 bg-white p-3 flex items-center justify-center overflow-hidden">
                          {settings.qrisImage ? (
                            <img src={settings.qrisImage} alt="QRIS QR Code" className="w-[170px] h-[170px] object-contain" />
                          ) : (
                            /* Visual placeholders fallback QR Code */
                            <div className="w-full h-full border border-dashed border-zinc-300 rounded-lg flex flex-col justify-center items-center p-2 text-zinc-700 bg-zinc-50">
                              <QrCode size={36} className="text-zinc-600 animate-pulse mb-1" />
                              <span className="text-[8px] font-bold text-center uppercase tracking-tighter">QRIS BELUM DIUNGGAH</span>
                              <span className="text-[7px] text-center text-zinc-500">Gunakan DANA/GoPay/Via Chat</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">Screnshoot QR untuk scan di aplikasi</p>
                      </div>
                    )}

                    {checkout.paymentMethod === 'dana' && (
                      <div className="space-y-3.5">
                        <div className="text-center">
                          <p className="text-xs text-zinc-300">Silakan transfer / kirim dana ke akun DANA Admin:</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black border border-white/5 space-y-2 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Nomor DANA:</span>
                            <span className="text-white font-bold">{settings.danaNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Atas Nama (A/N):</span>
                            <span className="text-zinc-300 line-clamp-1">{settings.danaName}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(settings.danaNumber, 'dana')}
                          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl transition cursor-pointer"
                        >
                          {copiedText === 'dana' ? <Check size={14} className="text-zinc-400" /> : <Copy size={14} />}
                          {copiedText === 'dana' ? 'Nomor DANA Berhasil Disalin!' : 'Salin Nomor DANA'}
                        </button>
                      </div>
                    )}

                    {checkout.paymentMethod === 'gopay' && (
                      <div className="space-y-3.5">
                        <div className="text-center">
                          <p className="text-xs text-zinc-300">Kirim saldo / transfer GoPay ke akun GOPAY Admin:</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black border border-white/5 space-y-2 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Nomor GoPay:</span>
                            <span className="text-white font-bold">{settings.gopayNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Atas Nama (A/N):</span>
                            <span className="text-zinc-300 line-clamp-1">{settings.gopayName}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(settings.gopayNumber, 'gopay')}
                          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl transition cursor-pointer"
                        >
                          {copiedText === 'gopay' ? <Check size={14} className="text-zinc-400" /> : <Copy size={14} />}
                          {copiedText === 'gopay' ? 'Nomor GoPay Berhasil Disalin!' : 'Salin Nomor GoPay'}
                        </button>
                      </div>
                    )}

                    {checkout.paymentMethod === 'chat' && (
                      <div className="text-center space-y-3 py-2">
                        <p className="text-xs text-zinc-300">
                          Transfer manual, butuh negosiasi, atau ingin menanyakan metode e-wallet lain? Hubungi admin via chat WhatsApp langsung.
                        </p>
                        <div className="p-3 rounded-xl bg-black border border-white/5 text-2xs text-zinc-500 font-mono uppercase">
                          No WA Admin: {settings.adminWA}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Instructions for next flow */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 flex gap-3 items-start">
                    <AlertCircle size={16} className="text-zinc-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-white font-mono">PENTING / WAJIB BACA:</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                        Setelah membayar, klik tombol **"Kirim Bukti Ke WhatsApp"** di bawah. Anda akan dialihkan ke WA admin dengan deskripsi teks pesanan otomatis. Admin akan memvalidasi bukti lalu menyerahkan produk Anda.
                      </p>
                    </div>
                  </div>

                  {/* Final Actions */}
                  <div className="space-y-2">
                    <a
                      href={buildWhatsAppLinkAndFinish()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleCompleteOrder}
                      className="w-full py-3.5 px-4 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 transition text-center text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase tracking-wider"
                    >
                      <Send size={14} />
                      Kirim Bukti Ke WhatsApp (Kirim WA)
                    </a>
                    
                    <button
                      onClick={() => setCheckout(null)}
                      className="w-full py-2.5 text-2xs font-semibold text-zinc-400 hover:text-white transition uppercase font-mono tracking-widest text-center"
                    >
                      Batalkan / kembali ke menu
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple Helper XIcon inline component to avoid missing imported parts
function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
