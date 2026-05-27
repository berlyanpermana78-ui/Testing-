import React, { useState, useEffect } from 'react';
import LiquidBackground from './components/LiquidBackground';
import StoreFront from './components/StoreFront';
import AdminDashboard from './components/AdminDashboard';
import { Product, AdminSettings } from './types';
import { Sparkles, ShoppingBag, Eye, Settings, HelpCircle, LayoutGrid, Award } from 'lucide-react';

export default function App() {
  // Initialize state from local storage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('liquid_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse products', e);
      }
    }
    // "buat pruduk 0" -> start with 0 products by default
    return [];
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('liquid_admin_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    // Default config values
    return {
      storeName: 'Void Glass Store',
      adminWA: '628123456789', // Default Indonesian code format
      adminFee: 2500, // Flat added admin fee for revenue
      danaNumber: '081234567890',
      danaName: 'ALDI PRATAMA',
      gopayNumber: '081234567890',
      gopayName: 'ALDI PRATAMA',
      qrisImage: '', // Start empty, let admin upload base64
      qrisText: ''
    };
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync state changes to simple localStorage triggers safely
  useEffect(() => {
    localStorage.setItem('liquid_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('liquid_admin_settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="relative min-h-screen font-sans flex flex-col justify-between">
      {/* 1. Glassmorphic Ambient Background */}
      <LiquidBackground />

      {/* Elegant Header Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent z-50 pointer-events-none" />

      {/* Simple UI Header Banner to remind about empty state when products = 0 */}
      {products.length === 0 && (
        <div className="bg-white/[0.02] border-b border-white/5 py-3 px-4 text-center mt-2 mx-4 rounded-2xl backdrop-blur-md">
          <p className="text-2xs sm:text-xs text-zinc-400 font-mono tracking-wide flex items-center justify-center gap-2 flex-wrap">
            <Sparkles size={12} className="text-white animate-pulse" />
            <span>Etalase kosong (0 produk). Buka panel admin untuk menambahkan produk kustom Anda!</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="ml-2 px-3 py-1 bg-white text-zinc-950 hover:bg-zinc-200 transition text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer"
            >
              Atur Sekarang
            </button>
          </p>
        </div>
      )}

      {/* 2. Primary Storefront Interface */}
      <main className="flex-grow flex items-center justify-center py-4">
        <StoreFront 
          products={products}
          setProducts={setProducts}
          settings={settings}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      </main>

      {/* 3. Sliding Admin Overlay Modal dashboard */}
      {isAdminOpen && (
        <AdminDashboard 
          products={products}
          setProducts={setProducts}
          settings={settings}
          setSettings={setSettings}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
