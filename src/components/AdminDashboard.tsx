import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, Edit3, Save, Upload, X, Settings, 
  ShoppingBag, HelpCircle, Key, RefreshCw, CheckCircle2,
  Phone, CreditCard, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { Product, AdminSettings } from '../types';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  settings: AdminSettings;
  setSettings: React.Dispatch<React.SetStateAction<AdminSettings>>;
  onClose: () => void;
}

export default function AdminDashboard({
  products,
  setProducts,
  settings,
  setSettings,
  onClose
}: AdminDashboardProps) {
  // Passcode authentication for setting a slight layer of reality
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Store settings inputs
  const [storeName, setStoreName] = useState(settings.storeName);
  const [adminWA, setAdminWA] = useState(settings.adminWA);
  const [adminFee, setAdminFee] = useState(settings.adminFee);
  const [danaNumber, setDanaNumber] = useState(settings.danaNumber);
  const [danaName, setDanaName] = useState(settings.danaName);
  const [gopayNumber, setGopayNumber] = useState(settings.gopayNumber);
  const [gopayName, setGopayName] = useState(settings.gopayName);
  const [qrisImage, setQrisImage] = useState(settings.qrisImage);
  const [qrisText, setQrisText] = useState(settings.qrisText);

  // New product inputs
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdStock, setNewProdStock] = useState<number | ''>('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [prodImagePreview, setProdImagePreview] = useState('');

  // Editing state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState<number>(0);
  const [editProdStock, setEditProdStock] = useState<number>(0);
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdImage, setEditProdImage] = useState('');

  // Image upload refs
  const settingsQrisFileRef = useRef<HTMLInputElement>(null);
  const productImgFileRef = useRef<HTMLInputElement>(null);
  const editProductImgFileRef = useRef<HTMLInputElement>(null);

  // Status message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'err' } | null>(null);

  const showToast = (text: string, type: 'success' | 'err' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'adminbilal123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      showToast('Login Admin Berhasil');
    } else {
      setPasscodeError('Passcode salah.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  // Handle setting QRIS photo
  const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setQrisImage(base64String);
        showToast('Foto QRIS berhasil dimuat!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle product photo upload
  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing) {
          setEditProdImage(base64String);
        } else {
          setNewProdImage(base64String);
          setProdImagePreview(base64String);
        }
        showToast('Foto produk berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Config Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Format WA number: remove non-numeric
    let formattedWA = adminWA.replace(/\D/g, '');
    if (formattedWA.startsWith('0')) {
      formattedWA = '62' + formattedWA.substring(1);
    }
    if (!formattedWA) {
      showToast('Nomor WA tidak valid', 'err');
      return;
    }

    const updatedSettings: AdminSettings = {
      storeName: storeName || 'Toko Monokrom',
      adminWA: formattedWA,
      qrisImage,
      qrisText,
      danaNumber: danaNumber || '-',
      danaName: danaName || '-',
      gopayNumber: gopayNumber || '-',
      gopayName: gopayName || '-',
      adminFee: Number(adminFee) || 0
    };

    setSettings(updatedSettings);
    localStorage.setItem('liquid_admin_settings', JSON.stringify(updatedSettings));
    showToast('Pengaturan Toko berhasil disimpan!');
  };

  // Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || newProdPrice === '' || newProdStock === '') {
      showToast('Lengkapi nama, harga, dan stok produk!', 'err');
      return;
    }

    const newProduct: Product = {
      id: 'prod_' + Date.now(),
      name: newProdName,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      image: newProdImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop', // default premium headphone
      description: newProdDesc || 'Tidak ada deskripsi.'
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('liquid_products', JSON.stringify(updatedProducts));

    // Reset Inputs
    setNewProdName('');
    setNewProdPrice('');
    setNewProdStock('');
    setNewProdDesc('');
    setNewProdImage('');
    setProdImagePreview('');
    showToast('Produk baru berhasil ditambahkan!');
  };

  // Edit Product Flow
  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditProdName(p.name);
    setEditProdPrice(p.price);
    setEditProdStock(p.stock);
    setEditProdDesc(p.description);
    setEditProdImage(p.image);
  };

  const handleSaveEdit = (id: string) => {
    if (!editProdName) {
      showToast('Nama produk tidak boleh kosong!', 'err');
      return;
    }

    const updated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: editProdName,
          price: Number(editProdPrice),
          stock: Number(editProdStock),
          description: editProdDesc,
          image: editProdImage
        };
      }
      return p;
    });

    setProducts(updated);
    localStorage.setItem('liquid_products', JSON.stringify(updated));
    setEditingProductId(null);
    showToast('Produk berhasil diperbarui!');
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      const filtered = products.filter(p => p.id !== id);
      setProducts(filtered);
      localStorage.setItem('liquid_products', JSON.stringify(filtered));
      showToast('Produk berhasil dihapus');
    }
  };

  // Demo initializer removed as requested

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-xl ${
          toastMessage.type === 'success' ? 'bg-zinc-900/90 border-white/20 text-white' : 'bg-red-950/90 border-red-500/20 text-red-200'
        } shadow-lg animate-bounce`}>
          <CheckCircle2 size={18} className={toastMessage.type === 'success' ? 'text-zinc-400' : 'text-red-400'} />
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-white uppercase sm:text-xl">Admin Dashboard</h1>
              <p className="text-xs text-zinc-400">Kelola toko monokrom & sistem pembayaran</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
          >
            <X size={18} className="text-zinc-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
            <div className="p-4 mb-4 rounded-full bg-white/5 border border-white/10">
              <Key size={36} className="text-zinc-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold font-display text-white">Login Dashboard Admin</h2>
            <p className="max-w-sm mb-6 text-sm text-zinc-400">
              Ubah rincian pembayaran, tambahkan produk baru, dan atur nomor tujuan WhatsApp.
            </p>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Masukkan Passcode Admin"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError('');
                  }}
                  className="w-full px-4 py-3 text-center text-sm rounded-xl glass-input text-white"
                />
                {passcodeError && (
                  <p className="mt-2 text-xs text-red-400 font-medium">{passcodeError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 text-xs tracking-wider uppercase font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl transition cursor-pointer"
              >
                Masuk Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Main Dashboard Area */
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
            
            {/* Action Top Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Status Sesi:</span>
                <span className="ml-2 font-mono text-xs bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-full text-zinc-300">
                  ADMIN AKTIF
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer bg-red-950/20 border border-red-500/10 hover:bg-red-950/30 rounded-xl"
                >
                  Keluar Admin
                </button>
              </div>
            </div>

            {/* Grid forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Form 1: Store & Payment Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Phone size={16} className="text-zinc-400" />
                  <h3 className="text-md font-bold font-display text-white">Konfigurasi Pembayaran & WA</h3>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  {/* Store Name & Admin Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Nama Toko</label>
                      <input
                        type="text"
                        placeholder="Nama Toko"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Nomor WA Admin</label>
                      <input
                        type="text"
                        placeholder="e.g. 628123456789"
                        value={adminWA}
                        onChange={(e) => setAdminWA(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-white text-zinc-200"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">Diawali kode negara (62).</span>
                    </div>
                  </div>

                  {/* Admin Fee Addition */}
                  <div>
                    <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Biaya Admin Tambahan (Rp)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={adminFee === 0 ? '' : adminFee}
                      onChange={(e) => setAdminFee(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-white"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">Biaya flat tambahan ketika checkout untuk pemasukan sampingan.</span>
                  </div>

                  {/* DANA Settings */}
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <div className="text-xs font-semibold text-zinc-300 font-display flex items-center gap-1.5">
                      <CreditCard size={14} className="text-zinc-400" />
                      Rekening DANA
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] text-zinc-400 font-mono">Nomor DANA</label>
                        <input
                          type="text"
                          placeholder="Nomor DANA admin"
                          value={danaNumber}
                          onChange={(e) => setDanaNumber(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-zinc-400 font-mono">Atas Nama (A/N)</label>
                        <input
                          type="text"
                          placeholder="Nama pemilik DANA"
                          value={danaName}
                          onChange={(e) => setDanaName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GoPay Settings */}
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <div className="text-xs font-semibold text-zinc-300 font-display flex items-center gap-1.5">
                      <CreditCard size={14} className="text-zinc-400" />
                      Rekening GoPay
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] text-zinc-400 font-mono">Nomor GoPay</label>
                        <input
                          type="text"
                          placeholder="Nomor GoPay admin"
                          value={gopayNumber}
                          onChange={(e) => setGopayNumber(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-zinc-400 font-mono">Atas Nama (A/N)</label>
                        <input
                          type="text"
                          placeholder="Nama pemilik GoPay"
                          value={gopayName}
                          onChange={(e) => setGopayName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QRIS Settings */}
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <div className="text-xs font-semibold text-zinc-300 font-display flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-zinc-400" />
                      Layanan QRIS Standar (Bisa Upload Gambar)
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-16 h-16 border border-white/10 rounded-xl overflow-hidden bg-black flex items-center justify-center shrink-0">
                        {qrisImage ? (
                          <img src={qrisImage} alt="QRIS preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-mono font-bold">NO QRIS</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => settingsQrisFileRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl transition cursor-pointer"
                        >
                          <Upload size={14} />
                          Unggah File QRIS (JPEG/PNG)
                        </button>
                        <input
                          type="file"
                          ref={settingsQrisFileRef}
                          onChange={handleQrisFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <input
                          type="text"
                          placeholder="Atau Paste URL Gambar QRIS"
                          value={qrisImage.startsWith('data:') ? '' : qrisImage}
                          onChange={(e) => setQrisImage(e.target.value)}
                          className="w-full px-3 py-2 text-[10px] rounded-xl glass-input text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-xs tracking-wider uppercase font-semibold text-zinc-900 bg-white hover:bg-zinc-200 transition rounded-xl cursor-pointer"
                  >
                    Simpan Pengaturan
                  </button>
                </form>
              </div>

              {/* Form 2: Add New Product */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Plus size={16} className="text-zinc-400" />
                  <h3 className="text-md font-bold font-display text-white">Tambah Produk Baru</h3>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Nama Produk</label>
                    <input
                      type="text"
                      placeholder="e.g. Mechanical Sleek Keyboard"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-white"
                    />
                  </div>

                  {/* Price & Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Harga (Rp)</label>
                      <input
                        type="number"
                        placeholder="e.g. 850000"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Stok Tersedia</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-white"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block mb-1 text-2xs text-zinc-400 uppercase font-semibold font-mono">Deskripsi Produk (Singkat)</label>
                    <textarea
                      placeholder="Tulis spesifikasi atau info penting produk..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white resize-none"
                    />
                  </div>

                  {/* Product Image Upload */}
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <label className="block text-2xs text-zinc-400 uppercase font-semibold font-mono">Gambar / Foto Produk</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 border border-white/10 rounded-xl overflow-hidden bg-black flex items-center justify-center shrink-0">
                        {prodImagePreview ? (
                          <img src={prodImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => productImgFileRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl transition cursor-pointer"
                        >
                          <Upload size={14} />
                          Pilih Foto dari Penyimpanan
                        </button>
                        <input
                          type="file"
                          ref={productImgFileRef}
                          onChange={(e) => handleProductFileChange(e, false)}
                          accept="image/*"
                          className="hidden"
                        />
                        <input
                          type="text"
                          placeholder="Atau Paste URL Gambar"
                          value={newProdImage.startsWith('data:') ? '' : newProdImage}
                          onChange={(e) => {
                            setNewProdImage(e.target.value);
                            setProdImagePreview(e.target.value);
                          }}
                          className="w-full px-3 py-2 text-[10px] rounded-xl glass-input text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-xs tracking-wider uppercase font-semibold text-black bg-white hover:bg-zinc-200 transition rounded-xl cursor-pointer"
                  >
                    Tambah Produk ke Etalase
                  </button>
                </form>
              </div>

            </div>

            {/* List of Current Products with Inline Edit */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-zinc-400" />
                  <h3 className="text-md font-bold font-display text-white">Daftar Produk Toko ({products.length})</h3>
                </div>
                <div className="text-xs text-zinc-400 font-mono">Total Produk: {products.length}</div>
              </div>

              {products.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/5">
                  <span className="text-zinc-500 text-xs">Belum ada produk aktif yang terdaftar di etalase. Silakan masukkan produk baru di atas.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(p => {
                    const isEditing = editingProductId === p.id;
                    return (
                      <div 
                        key={p.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-start relative hover:border-white/10 transition"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>

                        {isEditing ? (
                          /* Inline edit form */
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              value={editProdName} 
                              onChange={(e) => setEditProdName(e.target.value)} 
                              className="w-full px-2 py-1 text-xs rounded border border-white/20 bg-black text-white"
                              placeholder="Nama produk"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-zinc-500 block uppercase">Harga Rp</label>
                                <input 
                                  type="number" 
                                  value={editProdPrice} 
                                  onChange={(e) => setEditProdPrice(Number(e.target.value))} 
                                  className="w-full px-2 py-1 text-xs rounded border border-white/20 bg-black text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 block uppercase">Stok</label>
                                <input 
                                  type="number" 
                                  value={editProdStock} 
                                  onChange={(e) => setEditProdStock(Number(e.target.value))} 
                                  className="w-full px-2 py-1 text-xs rounded border border-white/20 bg-black text-white"
                                />
                              </div>
                            </div>
                            <textarea 
                              value={editProdDesc} 
                              onChange={(e) => setEditProdDesc(e.target.value)} 
                              className="w-full p-2 text-2xs rounded border border-white/20 bg-black text-white"
                              rows={2}
                              placeholder="Deskripsi singkat"
                            />
                            
                            {/* Base64 edit upload */}
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => editProductImgFileRef.current?.click()}
                                className="px-2 py-1 text-[9px] bg-white/10 rounded hover:bg-white/20"
                              >
                                Ganti Foto
                              </button>
                              <input
                                type="file"
                                ref={editProductImgFileRef}
                                onChange={(e) => handleProductFileChange(e, true)}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={() => setEditingProductId(null)}
                                className="px-2.5 py-1 text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => handleSaveEdit(p.id)}
                                className="px-2.5 py-1 text-[10px] font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Read view */
                          <div className="flex-1 pr-12">
                            <h4 className="text-zinc-100 font-semibold text-sm line-clamp-1">{p.name}</h4>
                            <p className="text-xs font-semibold text-zinc-400 font-mono mt-1">
                              Rp {p.price.toLocaleString('id-ID')}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                p.stock > 0 ? 'bg-zinc-900 border border-zinc-700/50 text-zinc-300' : 'bg-red-950/20 border border-red-500/20 text-red-400'
                              }`}>
                                Stok: {p.stock}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{p.description}</p>
                          </div>
                        )}

                        {!isEditing && (
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            <button
                              onClick={() => startEditing(p)}
                              className="p-1.5 text-zinc-400 hover:text-white transition rounded-lg hover:bg-white/5"
                              title="Edit Produk"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 transition rounded-lg hover:bg-red-950/20"
                              title="Hapus Produk"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
