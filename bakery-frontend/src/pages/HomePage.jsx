import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, marketingAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useProducts } from '../hooks/useProducts';
import { useReducedMotion } from 'framer-motion';

/* ─── Modular Components ─── */
import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';
import WhyChooseUs from '../components/home/WhyChooseUs';

import '../stores.css';

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();

  // API Hooks
  const { products: featuredProducts, loading: loadingFeatured } = useProducts({ bestSeller: 'true', limit: 5 });
  const { execute: fetchCats, data: categoriesRes } = useApi(productAPI.getCategories);
  const { execute: fetchBanners, data: bannersRes } = useApi(marketingAPI.getBanners);

  useEffect(() => {
    fetchCats();
    fetchBanners();
  }, [fetchCats, fetchBanners]);

  const categories = categoriesRes?.data || [];
  const banners = bannersRes?.data || [];

  console.log('[HOME DEBUG] Categories:', categories.length);
  console.log('[HOME DEBUG] Featured:', featuredProducts.length);

  const scrollToAllWithCategory = useCallback((catId) => {
    if (catId === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?categoryId=${catId}`);
    }
  }, [navigate]);

  return (
    <>
      {/* 1. Hero & Branding */}
      <HeroBanner banners={banners} reduceMotion={reduceMotion} />
      
      {/* 2. Navigation & Discovery */}
      {categories.length > 0 && (
        <div id="all-products">
          <CategoryGrid categories={categories} onPick={scrollToAllWithCategory} />
        </div>
      )}
      
      {/* 3. Social Proof & Trust */}
      <FeaturedProducts products={featuredProducts} loading={loadingFeatured} reduceMotion={reduceMotion} />
      <WhyChooseUs reduceMotion={reduceMotion} />
      
    </>
  );
}
