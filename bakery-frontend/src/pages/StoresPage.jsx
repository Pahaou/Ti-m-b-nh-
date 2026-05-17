import { useReducedMotion } from 'framer-motion';
import StoreSystem from '../components/home/StoreSystem';

export default function StoresPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="page-container">
      <StoreSystem reduceMotion={reduceMotion} headingLevel="h1" compact />
    </main>
  );
}
