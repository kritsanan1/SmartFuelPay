import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fuel, Globe } from "lucide-react";
import { ProgressSteps } from "@/components/progress-steps";
import { AmountSelection } from "@/components/amount-selection";
import { QRPayment } from "@/components/qr-payment";
import { PaymentSuccess } from "@/components/payment-success";
import { PaymentError } from "@/components/payment-error";
import { TransactionHistory } from "@/components/transaction-history";
import { usePayment } from "@/hooks/use-payment";
import { LANGUAGES, TRANSLATIONS, PAYMENT_STATUS } from "@/lib/constants";

type Screen = "amount" | "qr" | "success" | "error";

export default function FuelDispenser() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [language, setLanguage] = useState<string>(LANGUAGES.TH);

  const {
    currentTransactionId,
    countdown,
    isCountdownActive,
    paymentStatus,
    isGeneratingQR,
    isCancellingPayment,
    qrData,
    generateQR,
    cancelPayment,
    resetPayment,
    formatCountdown,
  } = usePayment();

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  const handleAmountChange = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleGenerateQR = () => {
    generateQR(selectedAmount);
    setCurrentScreen("qr");
  };

  const handleCancelPayment = () => {
    cancelPayment();
    setCurrentScreen("amount");
  };

  const handleRetryPayment = () => {
    resetPayment();
    setCurrentScreen("amount");
  };

  const handleBackToAmount = () => {
    resetPayment();
    setCurrentScreen("amount");
  };

  const handleNewTransaction = () => {
    resetPayment();
    setSelectedAmount(0);
    setCurrentScreen("amount");
  };

  const toggleLanguage = () => {
    setLanguage(language === LANGUAGES.TH ? LANGUAGES.EN : LANGUAGES.TH);
  };

  const getCurrentStep = () => {
    switch (currentScreen) {
      case "amount":
        return 1;
      case "qr":
        return 2;
      case "success":
        return 3;
      case "error":
        return 2;
      default:
        return 1;
    }
  };

  // Handle payment status changes
  if (paymentStatus === PAYMENT_STATUS.SUCCESS && currentScreen !== "success") {
    setCurrentScreen("success");
  } else if (
    (paymentStatus === PAYMENT_STATUS.FAILED || paymentStatus === PAYMENT_STATUS.TIMEOUT) &&
    currentScreen !== "error"
  ) {
    setCurrentScreen("error");
  }

  return (
    <div className="min-h-screen bg-clean-white font-sans">
      {/* Header */}
      <header className="bg-trust-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Fuel className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <p className="text-blue-100 font-roboto">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleLanguage}
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === LANGUAGES.TH ? "EN" : "ไทย"}
              </Button>
              <div className="text-right">
                <div className="text-sm text-blue-100">หัวจ่าย / Pump</div>
                <div className="text-xl font-bold">03</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps */}
        <ProgressSteps currentStep={getCurrentStep()} language={language} />

        {/* Screen Content */}
        {currentScreen === "amount" && (
          <AmountSelection
            selectedAmount={selectedAmount}
            onAmountChange={handleAmountChange}
            onGenerateQR={handleGenerateQR}
            isGenerating={isGeneratingQR}
            language={language}
          />
        )}

        {currentScreen === "qr" && qrData && (
          <QRPayment
            qrData={qrData.qrCodeData}
            transactionId={qrData.transactionId}
            amount={qrData.amount}
            countdown={formatCountdown(countdown)}
            isWaiting={isCountdownActive}
            onCancel={handleCancelPayment}
            isCancelling={isCancellingPayment}
            language={language}
          />
        )}

        {currentScreen === "success" && currentTransactionId && (
          <PaymentSuccess
            transactionId={currentTransactionId}
            amount={selectedAmount}
            timestamp={new Date().toLocaleString(
              language === "th" ? "th-TH" : "en-US"
            )}
            onNewTransaction={handleNewTransaction}
            language={language}
          />
        )}

        {currentScreen === "error" && (
          <PaymentError
            onRetry={handleRetryPayment}
            onBackToAmount={handleBackToAmount}
            language={language}
          />
        )}

        {/* Transaction History */}
        <div className="mt-8">
          <TransactionHistory language={language} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-strong-black text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">ศูนย์ช่วยเหลือ / Help Center</h4>
              <div className="space-y-2 text-neutral-grey">
                <p>📞 โทร: 1234 (24 ชม.)</p>
                <p>📧 Email: support@fuel.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">การชำระเงิน / Payment Methods</h4>
              <div className="flex space-x-4">
                <div className="bg-white rounded p-2">
                  <div className="text-trust-blue text-2xl font-bold">VISA</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-warning-orange text-2xl font-bold">MC</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-success-green text-2xl font-bold">📱</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">ความปลอดภัย / Security</h4>
              <div className="text-neutral-grey">
                <p className="text-sm">ระบบรักษาความปลอดภัยระดับธนาคาร</p>
                <p className="text-sm font-roboto">Bank-level security system</p>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-grey/30 mt-8 pt-8 text-center text-neutral-grey">
            <p>&copy; 2024 Automated Fuel Dispensing System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
