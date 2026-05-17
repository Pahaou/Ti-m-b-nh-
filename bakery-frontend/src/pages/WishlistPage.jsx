import { useEffect, useState } from 'react';
import { wishlistAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Spinner } from '../components/LoadingSpinner';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlistItems = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch on mount - no dependency on wishlist to avoid infinite loop
  useEffect(() => {
    loadWishlistItems();
  }, []);

  return (
    <div style={{background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <div className="container" style={{paddingTop: '120px', paddingBottom: '60px', flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40}}>
          <Heart size={32} color="#ff5252" fill="#ff5252" />
          <h1 style={{margin: 0, fontWeight: 800}}>Sản Phẩm Yêu Thích</h1>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '100px 0'}}>
            <Spinner size={40} color="var(--primary)" />
          </div>
        ) : products.length === 0 ? (
          <div style={{textAlign: 'center', padding: '100px 0', background: 'var(--bg-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)'}}>
            <Heart size={60} color="var(--text-muted)" style={{marginBottom: 20}} />
            <h2 style={{color: 'var(--text-main)', marginBottom: 20, fontWeight: 700}}>Bạn chưa có sản phẩm yêu thích nào.</h2>
            <Link to="/" className="btn-primary" style={{textDecoration: 'none'}}>Khám Phá Menu Thơm Ngon</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(item => (
              <ProductCard key={item.product_id} item={{...item, id: item.product_id}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
