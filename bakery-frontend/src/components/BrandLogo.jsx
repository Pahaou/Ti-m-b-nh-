import { useNavigate } from 'react-router-dom';

export default function BrandLogo({ size = 'md', onDark = false, onClick }) {
  const navigate = useNavigate();

  const sizes = {
    sm: { scale: 0.5, height: '45px' },
    md: { scale: 0.8, height: '70px' },
    lg: { scale: 1.2, height: '110px' },
    xl: { scale: 1.8, height: '160px' }
  };

  const currentSize = sizes[size];
  const textColor = onDark ? '#FFFFFF' : '#3E2723';
  const subtextColor = onDark ? 'rgba(255,255,255,0.7)' : '#4E342E';
  const tagBg = onDark ? 'rgba(255,255,255,0.1)' : '#F5F5F5';
  const tagBorder = onDark ? 'rgba(255,255,255,0.15)' : '#EEEEEE';

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`brand-logo brand-logo-${size}`}
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        userSelect: 'none',
        gap: '15px',
        width: 'fit-content'
      }}
    >
      {/* New Strawberry Cake Badge Icon with Frame */}
      <div style={{ 
        width: size === 'sm' ? '54px' : size === 'md' ? '72px' : '96px', 
        height: size === 'sm' ? '54px' : size === 'md' ? '72px' : '96px', 
        borderRadius: '50%', 
        background: 'white',
        border: '2px solid var(--primary-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(248, 164, 180, 0.15)'
      }}>
        <div style={{
          width: '85%',
          height: '85%',
          borderRadius: '50%',
          background: '#FDE4E7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80%', height: '80%' }}>
            {/* Chocolate Cake Base */}
            <path d="M20 65C20 60 80 60 80 65V80C80 85 20 85 20 80V65Z" fill="#5D4037" />
            
            {/* Pink Dripping Frosting */}
            <path d="M20 60C20 55 80 55 80 60V75C80 75 75 80 65 72C55 64 45 80 35 72C25 64 20 75 20 75V60Z" fill="var(--primary)" />
            
            {/* Whipped Cream */}
            <path d="M30 55C30 45 70 45 70 55C70 60 30 60 30 55Z" fill="white" />
            <path d="M35 50C35 42 65 42 65 50" fill="white" />
            <path d="M40 45C40 38 60 38 60 45" fill="white" />

            {/* Strawberry on Top */}
            <path d="M50 48C42 48 40 30 50 25C60 30 58 48 50 48Z" fill="#E84A5F" />
            <circle cx="47" cy="35" r="0.6" fill="white" opacity="0.8" />
            <circle cx="53" cy="35" r="0.6" fill="white" opacity="0.8" />
            <circle cx="50" cy="40" r="0.6" fill="white" opacity="0.8" />
            <path d="M48 26L50 22L52 26" stroke="#4E342E" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Brand Text Part */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ 
            fontFamily: '"Playfair Display", serif', 
            fontSize: size === 'sm' ? '24px' : size === 'md' ? '32px' : '44px', 
            color: '#3E2723',
            lineHeight: 1,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontWeight: 900
          }}>HXH</span>
          <span style={{ 
            fontFamily: '"Playfair Display", serif', 
            fontSize: size === 'sm' ? '20px' : size === 'md' ? '26px' : '36px', 
            fontWeight: '400',
            color: 'var(--primary)',
            lineHeight: 1,
            textTransform: 'lowercase',
            fontStyle: 'italic'
          }}>bakery</span>
        </div>
        
        <span style={{ 
          fontFamily: '"Dancing Script", cursive', 
          fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '18px', 
          fontWeight: '600', 
          color: '#8D6E63',
          marginTop: '2px',
          textAlign: 'center'
        }}>Dessert house</span>
      </div>
    </div>
  );
}
