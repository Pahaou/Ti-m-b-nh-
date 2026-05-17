import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { authAPI, orderAPI, paymentAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';

// Modular Components
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import AddressForm from '../components/checkout/AddressForm';
import PaymentMethods from '../components/checkout/PaymentMethods';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentQRModal from '../components/checkout/PaymentQRModal';

export default function CheckoutPage() {
  const { cart, cartTotal, cartLoaded, clearCart } = useContext(CartContext);
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [note, setNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [cakeMessage, setCakeMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  
  // Payment QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedPayerBank, setSelectedPayerBank] = useState(null);

  const { data: profileData, execute: fetchProfile } = useApi(authAPI.getProfile);
  const { loading: verifyingCoupon, execute: validateCoupon } = useApi(orderAPI.validateCoupon);
  const { loading: submitting, execute: createOrder } = useApi(orderAPI.create);
  const { execute: createPaymentIntent } = useApi(paymentAPI.createIntent);

  const addresses = profileData?.data?.addresses || [];

  useEffect(() => {
    if (cartLoaded && cart.length === 0 && !showQRModal) {
      navigate('/');
      return;
    }
    fetchProfile();
  }, [cartLoaded, cart.length, navigate, showQRModal, fetchProfile]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) setSelectedAddress(`${defaultAddr.receiver_name} - ${defaultAddr.receiver_phone} - ${defaultAddr.address_detail}`);
    }
  }, [addresses, selectedAddress]);

  useEffect(() => {
    setDiscountInfo(null);
  }, [cartTotal]);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      showWarning('Vui lòng nhập mã giảm giá.');
      return;
    }
    try {
      const res = await validateCoupon({ code, order_total: cartTotal });
      setDiscountInfo(res.data);
      setCouponCode(res.data.code);
      showSuccess(`Áp dụng mã giảm giá ${res.data.code} thành công!`);
    } catch (err) {
      setDiscountInfo(null);
      showError(err.response?.data?.message || 'Mã giảm giá không hợp lệ!');
    }
  };

  const shippingFee = cartTotal >= 500000 ? 0 : 30000;
  const discountAmount = discountInfo ? discountInfo.discount_amount : 0;
  const finalAmount = cartTotal + shippingFee - discountAmount;

  const handleCheckout = async (e) => {
    e.preventDefault();
    let addressToUse = selectedAddress;
    
    if (!addressToUse) {
      if (!newName || !newPhone || !newAddressDetail) {
        showWarning('Vui lòng điền đầy đủ thông tin giao hàng!');
        return;
      }
      addressToUse = `${newName} - ${newPhone} - ${newAddressDetail}`;
    }

    if (!deliveryDate || !deliveryTime) {
      showWarning('Vui lòng chọn ngày và giờ nhận bánh!');
      return;
    }

    const deliverySlot = new Date(`${deliveryDate}T${deliveryTime}`);
    const earliestSlot = new Date(Date.now() + 4 * 60 * 60 * 1000);
    if (Number.isNaN(deliverySlot.getTime()) || deliverySlot < earliestSlot) {
      showWarning('Vui lòng chọn thời gian nhận cách hiện tại ít nhất 4 giờ.');
      return;
    }

    const noteParts = [
      note?.trim(),
      `Ngày nhận bánh: ${deliveryDate}`,
      `Giờ nhận bánh: ${deliveryTime}`,
      cakeMessage?.trim() ? `Lời nhắn trên bánh: ${cakeMessage.trim()}` : null,
    ].filter(Boolean);

    try {
      const orderData = {
        shipping_address: addressToUse,
        customer_note: noteParts.join('\n'),
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        cake_message: cakeMessage.trim() || null,
        payment_method: paymentMethod,
        coupon_code: discountInfo ? discountInfo.code : null
      };

      const res = await createOrder(orderData);
      const newOrder = res.data;
      
      if (paymentMethod === 'COD') {
        await clearCart();
        showSuccess('Chúc mừng bạn đã đặt hàng thành công!');
        navigate('/my-orders');
      } else if (paymentMethod === 'MOMO') {
        try {
          const intentRes = await createPaymentIntent({
            provider: 'momo',
            orderId: newOrder.orderId,
            amount: newOrder.finalAmount,
          });
          const payUrl = intentRes.data?.payUrl;
          if (payUrl) {
            await clearCart();
            window.location.href = payUrl;
            return;
          }
          showWarning(intentRes.data?.message || 'MoMo chưa cấu hình. Đơn đã tạo — thanh toán COD hoặc chuyển khoản.');
        } catch (intentErr) {
          showError(intentErr.response?.data?.message || 'Không tạo được link MoMo.');
        }
        setCreatedOrder({ id: newOrder.orderId, amount: newOrder.finalAmount });
        setShowQRModal(true);
      } else if (paymentMethod === 'VNPAY') {
        try {
          const intentRes = await createPaymentIntent({
            provider: 'vnpay',
            orderId: newOrder.orderId,
            amount: newOrder.finalAmount,
          });
          const payUrl = intentRes.data?.payUrl;
          if (payUrl) {
            await clearCart();
            window.location.href = payUrl;
            return;
          }
          showWarning(intentRes.data?.message || 'VNPay chưa cấu hình.');
        } catch (intentErr) {
          showError(intentErr.response?.data?.message || 'Không tạo được link VNPay.');
        }
        setCreatedOrder({ id: newOrder.orderId, amount: newOrder.finalAmount });
        setShowQRModal(true);
      } else {
        setCreatedOrder({
            id: newOrder.orderId,
            amount: newOrder.finalAmount
        });
        setShowQRModal(true);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Lỗi khi đặt hàng!');
    }
  };

  const handleFinishPayment = async () => {
    await clearCart();
    showSuccess('Đơn hàng đang được chờ xác nhận thanh toán.');
    navigate('/my-orders');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showSuccess(`Đã sao chép ${label}!`);
  };

  if (!cartLoaded && !showQRModal) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
        <Spinner size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{background: 'var(--bg-main)', minHeight: '100vh'}}>
      <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        
        <CheckoutSteps currentStep={2} />

        <form onSubmit={handleCheckout} className="checkout-layout" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '40px', alignItems: 'start'}}>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
            <AddressForm 
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              newName={newName}
              setNewName={setNewName}
              newPhone={newPhone}
              setNewPhone={setNewPhone}
              newAddressDetail={newAddressDetail}
              setNewAddressDetail={setNewAddressDetail}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              deliveryTime={deliveryTime}
              setDeliveryTime={setDeliveryTime}
              cakeMessage={cakeMessage}
              setCakeMessage={setCakeMessage}
              note={note}
              setNote={setNote}
            />

            <PaymentMethods 
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              selectedPayerBank={selectedPayerBank}
              setSelectedPayerBank={setSelectedPayerBank}
            />
          </div>

          <OrderSummary 
            cart={cart}
            cartTotal={cartTotal}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            handleApplyCoupon={handleApplyCoupon}
            verifyingCoupon={verifyingCoupon}
            shippingFee={shippingFee}
            discountInfo={discountInfo}
            discountAmount={discountAmount}
            finalAmount={finalAmount}
            submitting={submitting}
          />
        </form>
      </div>

      <PaymentQRModal 
        showQRModal={showQRModal}
        setShowQRModal={setShowQRModal}
        createdOrder={createdOrder}
        paymentMethod={paymentMethod}
        selectedPayerBank={selectedPayerBank}
        copyToClipboard={copyToClipboard}
        handleFinishPayment={handleFinishPayment}
      />
    </div>
  );
}
