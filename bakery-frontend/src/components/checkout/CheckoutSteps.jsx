import { ChevronRight } from 'lucide-react';

export default function CheckoutSteps({ currentStep = 2 }) {
  const steps = [
    { id: 1, label: 'Giỏ hàng' },
    { id: 2, label: 'Thanh toán' },
    { id: 3, label: 'Hoàn tất' }
  ];

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '50px'}}>
      {steps.map((step, index) => (
        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: step.id === currentStep ? 'var(--primary)' : 'var(--text-light)'
          }}>
            <span style={{
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              background: step.id === currentStep ? 'var(--primary)' : 'transparent',
              border: step.id === currentStep ? 'none' : '2px solid var(--border-color)',
              color: step.id === currentStep ? 'white' : 'var(--text-light)',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              fontSize: 13,
              fontWeight: step.id === currentStep ? 'bold' : 'normal'
            }}>
              {step.id}
            </span>
            <span style={{ fontWeight: step.id === currentStep ? 800 : 600 }}>{step.label}</span>
          </div>
          {index < steps.length - 1 && <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      ))}
    </div>
  );
}
