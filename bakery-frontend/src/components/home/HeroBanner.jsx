import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

/* ─── floating decoration component ─── */
function FloatingDecoration({ icon: Icon, top, left, size = 40, delay = 0 }) {
  return (
    <motion.div
      className="floating-decoration"
      style={{ 
        position: 'absolute',
        top, 
        left, 
        color: 'var(--primary)', 
        opacity: 0.3,
        zIndex: 10,
        pointerEvents: 'none'
      }}
      animate={{ 
        y: [0, -25, 0],
        rotate: [0, 15, -15, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 10, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut" 
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

/* ─── sparkle effect component ─── */
function SparkleEffect({ count = 35 }) {
  const sparkles = useRef([...Array(count)].map(() => ({
    id: Math.random(),
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: `${4 + Math.random() * 5}s`,
    delay: `${Math.random() * 5}s`,
    scale: 0.3 + Math.random() * 0.8
  })));

  return (
    <div className="sparkle-container">
      {sparkles.current.map((s) => (
        <div 
          key={s.id}
          className="sparkle-particle"
          style={{
            top: s.top,
            left: s.left,
            animationDuration: s.duration,
            animationDelay: s.delay,
            transform: `scale(${s.scale})`
          }}
        />
      ))}
    </div>
  );
}

const FALLBACK_BANNERS = [
  { 
    id: 'f1', 
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1920&q=90&auto=format&fit=crop', 
    tag: 'Fresh Every Day',
    title: 'Bánh Kem Dâu Ngọt Ngào',
    subtitle: 'Lớp kem mềm mịn kết hợp dâu tươi tạo nên hương vị mùa hè dịu nhẹ.',
    btnText: 'Khám phá ngay'
  },
  { 
    id: 'f2', 
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1920&q=90&auto=format&fit=crop', 
    tag: 'Premium Collection',
    title: 'Chocolate Delight',
    subtitle: 'Socola đậm vị cùng lớp kem béo mịn cho trải nghiệm ngọt ngào hoàn hảo.',
    btnText: 'Xem bộ sưu tập'
  },
];

export default function HeroBanner({ banners, reduceMotion }) {
  const slides = banners && banners.length > 0 ? banners : FALLBACK_BANNERS;
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setImgError(false);
      setCurrent((p) => (p + 1) % slides.length);
    }, 8000);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const go = (dir) => {
    setImgError(false);
    setCurrent((p) => (p + dir + slides.length) % slides.length);
    resetTimer();
  };

  const currentImg = imgError 
    ? 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=85' 
    : slides[current].image_url;

  return (
    <section className="hero-banner" id="hero" style={{ overflow: 'hidden' }}>
      <SparkleEffect count={50} />
      
      <FloatingDecoration icon={Sparkles} top="12%" left="8%" size={40} delay={0} />
      <FloatingDecoration icon={Star} top="75%" left="12%" size={32} delay={2} />
      <FloatingDecoration icon={Sparkles} top="20%" left="88%" size={36} delay={4} />
      <FloatingDecoration icon={Star} top="65%" left="92%" size={28} delay={6} />

      <AnimatePresence initial={false} mode='wait'>
        <motion.div
          key={slides[current].id}
          className="hero-banner__slide"
          style={{ 
            backgroundImage: `url(${currentImg})`,
            position: 'absolute',
            inset: 0,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1 }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(135deg, rgba(255, 245, 246, 0.4) 0%, rgba(255, 245, 246, 0.2) 100%)',
            backdropFilter: 'blur(1px)'
          }} />
        </motion.div>
      </AnimatePresence>
      
      <div className="hero-banner__overlay" />

      <div className="hero-banner__content" style={{ padding: '0 10%' }}>
        <motion.div
          key={`text-${current}`}
          initial={reduceMotion ? false : { opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: 60 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="hero-banner__text"
          style={{ maxWidth: '580px' }}
        >
          <motion.span 
            className="hero-banner__badge"
            animate={{ boxShadow: ['0 4px 15px rgba(248,164,180,0.1)', '0 4px 25px rgba(248,164,180,0.3)', '0 4px 15px rgba(248,164,180,0.1)'] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨ <span className="shimmer-text" style={{ fontWeight: 800 }}>{slides[current].tag}</span>
          </motion.span>
          
          <h1 className="hero-banner__title" style={{ 
            fontSize: 'clamp(32px, 6vw, 68px)',
            textShadow: '0 10px 30px rgba(248, 164, 180, 0.15)',
            marginBottom: '24px'
          }}>
            {slides[current].title}
          </h1>
          
          <p className="hero-banner__desc" style={{ 
            fontSize: '18px', 
            maxWidth: '520px', 
            lineHeight: '1.6',
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            marginBottom: '40px'
          }}>
            {slides[current].subtitle}
          </p>
          
          <div className="hero-banner__actions">
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 25px 50px rgba(248, 164, 180, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              className="btn btn--primary btn--lg"
              onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ 
                padding: '18px 48px', 
                fontSize: '18px', 
                borderRadius: '50px',
                letterSpacing: '0.5px'
              }}
            >
              {slides[current].btnText} <ArrowRight size={20} style={{ marginLeft: '12px' }} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <button className="hero-banner__arrow hero-banner__arrow--left" onClick={() => go(-1)} aria-label="Trước" style={{ left: '40px' }}>
        <ChevronLeft size={32} />
      </button>
      <button className="hero-banner__arrow hero-banner__arrow--right" onClick={() => go(1)} aria-label="Sau" style={{ right: '40px' }}>
        <ChevronRight size={32} />
      </button>

      <div className="hero-banner__dots" style={{ bottom: '40px' }}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`hero-banner__dot ${i === current ? 'active' : ''}`}
            onClick={() => { setCurrent(i); resetTimer(); }}
            aria-label={`Slide ${i + 1}`}
            style={{ 
              width: i === current ? '48px' : '12px', 
              height: '8px',
              background: i === current ? 'var(--primary)' : 'rgba(248, 164, 180, 0.3)',
              borderRadius: '10px',
              transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />
        ))}
      </div>
    </section>
  );
}
