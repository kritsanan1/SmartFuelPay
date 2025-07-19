import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fuel, Globe, Activity } from "lucide-react";
import { ProgressSteps } from "@/components/progress-steps";
import { AmountSelection } from "@/components/amount-selection";
import { QRPayment } from "@/components/qr-payment";
import { PaymentSuccess } from "@/components/payment-success";
import { PaymentError } from "@/components/payment-error";
import { TransactionHistory } from "@/components/transaction-history";
import { HardwareControl } from "@/components/hardware-control";
import PumpStatusDisplay from "@/components/pump-status-display";
import { PumpVisualization } from "@/components/animated-fuel-flow";
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
    <div className="min-h-screen mobile-viewport-fix bg-gradient-to-br from-clean-white to-clean-white-warm font-sans">
      {/* Enhanced Header with Glass Effect */}
      <header className="bg-gradient-primary text-white shadow-strong sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto container-mobile py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 animate-fade-in">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <Fuel className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-mobile-title font-bold tracking-tight">{t.title}</h1>
                <p className="text-blue-100 text-sm sm:text-base hidden sm:block opacity-90">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={toggleLanguage}
                variant="secondary"
                className="glass-effect hover-lift press-effect focus-ring text-white border-white border-opacity-30 btn-mobile-sm backdrop-blur-sm transition-all duration-200"
              >
                <Globe className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline font-medium">
                  {language === LANGUAGES.TH ? "EN" : "ไทย"}
                </span>
              </Button>
              <div className="text-right glass-effect rounded-lg px-3 py-2 backdrop-blur-sm border border-white border-opacity-30">
                <div className="text-xs sm:text-sm text-blue-100 opacity-80">หัวจ่าย / Pump</div>
                <div className="text-lg sm:text-xl font-bold">03</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto container-mobile py-4 sm:py-6 md:py-8 max-w-6xl">
        {/* Progress Steps */}
        <ProgressSteps currentStep={getCurrentStep()} language={language} />

        {/* Real-time Pump Status */}
        <div className="spacing-mobile-md">
          <div className="grid-mobile-3 gap-4 sm:gap-6">
            {/* Main interface */}
            <div className="lg:col-span-2">
              {currentScreen === "amount" && (
                <AmountSelection
                  selectedAmount={selectedAmount}
                  onAmountChange={handleAmountChange}
                  onGenerateQR={handleGenerateQR}
                  isGenerating={isGeneratingQR}
                  language={language}
                />
              )}
            </div>
            
            {/* Live pump status */}
            <div className="lg:col-span-1">
              <PumpStatusDisplay 
                pumpId="03"
                showControls={true}
                compact={false}
              />
            </div>
          </div>
        </div>

        {/* Full screen content for other screens */}
        {currentScreen === "qr" && qrData && (
          <div className="grid-mobile-2 gap-4 sm:gap-6 md:gap-8">
            <div>
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
            </div>
            <div>
              <PumpVisualization
                isDispensing={paymentStatus === PAYMENT_STATUS.SUCCESS}
                flowRate={paymentStatus === PAYMENT_STATUS.SUCCESS ? 75 : 0}
                fuelType="gasohol95"
                targetAmount={selectedAmount}
                dispensedAmount={paymentStatus === PAYMENT_STATUS.SUCCESS ? selectedAmount * 0.8 : 0}
              />
            </div>
          </div>
        )}

        {currentScreen === "qr" && qrData && false && (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <PaymentSuccess
                transactionId={currentTransactionId}
                amount={selectedAmount}
                timestamp={new Date().toLocaleString(
                  language === "th" ? "th-TH" : "en-US"
                )}
                onNewTransaction={handleNewTransaction}
                language={language}
              />
            </div>
            <div>
              <PumpVisualization
                isDispensing={true}
                flowRate={90}
                fuelType="gasohol95"
                targetAmount={selectedAmount}
                dispensedAmount={selectedAmount}
              />
            </div>
          </div>
        )}

        {currentScreen === "error" && (
          <PaymentError
            onRetry={handleRetryPayment}
            onBackToAmount={handleBackToAmount}
            language={language}
          />
        )}

        {/* Hardware Control and Transaction History */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HardwareControl pumpId="03" language={language} />
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
