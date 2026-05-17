import { useReducedMotion } from 'framer-motion';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CustomerReviews from '../components/home/CustomerReviews';

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="page-container">
      <section className="container about-page">
        <div className="about-page__intro">
          <h1 className="section-title-new">Về HXH Bakery</h1>
          <p>
            HXH Bakery tập trung vào bánh tươi mỗi ngày, hương vị dễ ăn, đóng gói gọn đẹp
            và phù hợp cho sinh nhật, quà tặng, tiệc nhỏ hoặc bữa ngọt hằng ngày.
          </p>
        </div>
      </section>

      <WhyChooseUs reduceMotion={reduceMotion} />
      <CustomerReviews reduceMotion={reduceMotion} />
    </main>
  );
}
