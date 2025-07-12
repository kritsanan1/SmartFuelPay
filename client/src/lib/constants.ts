export const FUEL_TYPES = {
  GASOHOL_95: "Gasohol 95",
  GASOHOL_91: "Gasohol 91",
  DIESEL: "Diesel",
  PREMIUM_95: "Premium 95",
} as const;

export const PRICE_PER_LITER = {
  [FUEL_TYPES.GASOHOL_95]: 35.50,
  [FUEL_TYPES.GASOHOL_91]: 33.50,
  [FUEL_TYPES.DIESEL]: 32.50,
  [FUEL_TYPES.PREMIUM_95]: 38.50,
} as const;

export const QUICK_AMOUNTS = [100, 200, 500, 1000] as const;

export const PAYMENT_TIMEOUT = 300; // 5 minutes in seconds

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  TIMEOUT: "timeout",
} as const;

export const LANGUAGES = {
  TH: "th",
  EN: "en",
} as const;

export const TRANSLATIONS = {
  [LANGUAGES.TH]: {
    title: "ระบบจ่ายน้ำมันอัตโนมัติ",
    subtitle: "Automated Fuel Dispensing System",
    selectAmount: "เลือกจำนวนเงินที่ต้องการจ่าย",
    selectAmountEn: "Select the amount you want to pay",
    scanQR: "สแกน QR Code เพื่อชำระเงิน",
    scanQREn: "Scan QR Code to make payment",
    dispense: "จ่ายน้ำมัน",
    dispenseEn: "Dispense Fuel",
    currency: "บาท",
    generateQR: "สร้าง QR Code เพื่อชำระเงิน",
    generateQREn: "Generate QR Code for Payment",
    paymentSuccess: "ชำระเงินสำเร็จ!",
    paymentSuccessEn: "Payment Successful!",
    paymentFailed: "การชำระเงินไม่สำเร็จ",
    paymentFailedEn: "Payment Failed",
    waiting: "รอการชำระเงิน",
    waitingEn: "Waiting for payment confirmation",
    timeRemaining: "เวลาที่เหลือ",
    timeRemainingEn: "Time remaining",
    cancel: "ยกเลิกการชำระเงิน",
    cancelEn: "Cancel Payment",
    retry: "ลองอีกครั้ง",
    retryEn: "Try Again",
    newTransaction: "ทำรายการใหม่",
    newTransactionEn: "New Transaction",
    transactionHistory: "ประวัติการทำรายการ",
    transactionHistoryEn: "Transaction History",
    orderSummary: "สรุปการสั่งซื้อ",
    orderSummaryEn: "Order Summary",
  },
  [LANGUAGES.EN]: {
    title: "Automated Fuel Dispensing System",
    subtitle: "ระบบจ่ายน้ำมันอัตโนมัติ",
    selectAmount: "Select the amount you want to pay",
    selectAmountEn: "เลือกจำนวนเงินที่ต้องการจ่าย",
    scanQR: "Scan QR Code to make payment",
    scanQREn: "สแกน QR Code เพื่อชำระเงิน",
    dispense: "Dispense Fuel",
    dispenseEn: "จ่ายน้ำมัน",
    currency: "THB",
    generateQR: "Generate QR Code for Payment",
    generateQREn: "สร้าง QR Code เพื่อชำระเงิน",
    paymentSuccess: "Payment Successful!",
    paymentSuccessEn: "ชำระเงินสำเร็จ!",
    paymentFailed: "Payment Failed",
    paymentFailedEn: "การชำระเงินไม่สำเร็จ",
    waiting: "Waiting for payment confirmation",
    waitingEn: "รอการชำระเงิน",
    timeRemaining: "Time remaining",
    timeRemainingEn: "เวลาที่เหลือ",
    cancel: "Cancel Payment",
    cancelEn: "ยกเลิกการชำระเงิน",
    retry: "Try Again",
    retryEn: "ลองอีกครั้ง",
    newTransaction: "New Transaction",
    newTransactionEn: "ทำรายการใหม่",
    transactionHistory: "Transaction History",
    transactionHistoryEn: "ประวัติการทำรายการ",
    orderSummary: "Order Summary",
    orderSummaryEn: "สรุปการสั่งซื้อ",
  },
} as const;
