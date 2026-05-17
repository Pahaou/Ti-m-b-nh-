export const SHOP_PAYMENT_CONFIG = {
  // Thay đổi các thông tin này bằng thông tin thật của bạn khi ra production
  bank: {
    id: 'MB', // Mã VietQR (MB, VCB, TCB, ACB, ...)
    accountNo: '0901234567',
    accountName: 'HXH BAKERY - NGUYEN VAN A',
    bankName: 'MB Bank',
  },
  momo: {
    phoneNumber: '0901234567',
    accountName: 'NGUYEN VAN A',
  }
};

// Danh sách các ngân hàng hỗ trợ deep link (VietQR)
export const SUPPORTED_BANKS = [
  { id: 'vcb', name: 'Vietcombank', logo: 'https://api.vietqr.io/img/VCB.png' },
  { id: 'mbb', name: 'MB Bank', logo: 'https://api.vietqr.io/img/MB.png' },
  { id: 'tcb', name: 'Techcombank', logo: 'https://api.vietqr.io/img/TCB.png' },
  { id: 'acb', name: 'ACB', logo: 'https://api.vietqr.io/img/ACB.png' },
  { id: 'vpb', name: 'VPBank', logo: 'https://api.vietqr.io/img/VPB.png' },
  { id: 'bidv', name: 'BIDV', logo: 'https://api.vietqr.io/img/BIDV.png' },
  { id: 'ctg', name: 'VietinBank', logo: 'https://api.vietqr.io/img/ICB.png' },
  { id: 'tpv', name: 'TPBank', logo: 'https://api.vietqr.io/img/TPB.png' },
  { id: 'hdb', name: 'HDBank', logo: 'https://api.vietqr.io/img/HDB.png' },
  { id: 'shb', name: 'SHB', logo: 'https://api.vietqr.io/img/SHB.png' },
];
