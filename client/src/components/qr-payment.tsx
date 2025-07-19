import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qr-code";
import { X, Loader2 } from "lucide-react";
import { LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface QRPaymentProps {
  qrData: string;
  transactionId: string;
  amount: number;
  countdown: string;
  isWaiting: boolean;
  onCancel: () => void;
  isCancelling: boolean;
  language: string;
}

export function QRPayment({
  qrData,
  transactionId,
  amount,
  countdown,
  isWaiting,
  onCancel,
  isCancelling,
  language,
}: QRPaymentProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  return (
    <Card className="bg-white rounded-2xl shadow-strong hover-lift animate-fade-in">
      <CardContent className="card-mobile">
        <div className="text-center spacing-mobile-sm animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-warning rounded-full mb-4 shadow-medium animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-warning-orange rounded-full"></div>
            </div>
          </div>
          <h2 className="text-mobile-title font-bold text-strong-black tracking-tight">
            {t.scanQR}
          </h2>
          <p className="text-neutral-grey-light text-mobile-body">
            {t.scanQREn}
          </p>
        </div>

        <div className="grid-mobile-2 gap-4 sm:gap-6 md:gap-8">
          {/* Enhanced QR Code Display */}
          <div className="flex flex-col items-center spacing-mobile-sm">
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-clean-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-strong border-4 border-trust-blue/20 hover-lift animate-scale-in">
                <QRCode data={qrData} size={200} className="w-full h-auto max-w-[256px]" />
              </div>
              {/* Animated corner indicators */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-l-4 border-t-4 border-trust-blue rounded-tl-lg animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 border-r-4 border-t-4 border-trust-blue rounded-tr-lg animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-4 border-b-4 border-trust-blue rounded-bl-lg animate-pulse"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-4 border-b-4 border-trust-blue rounded-br-lg animate-pulse"></div>
            </div>

            {/* Enhanced Payment Instructions */}
            <div className="bg-gradient-to-br from-clean-white to-clean-white-warm rounded-xl p-6 max-w-md shadow-medium hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                <h4 className="font-bold text-strong-black tracking-tight">
                  วิธีชำระเงิน / Payment Instructions
                </h4>
              </div>
              <ol className="text-sm text-neutral-grey space-y-3">
                <li className="flex items-start animate-fade-in">
                  <span className="bg-gradient-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-soft">
                    1
                  </span>
                  <div>
                    <div className="font-medium text-strong-black">เปิดแอป Mobile Banking</div>
                    <div className="text-xs text-neutral-grey-light">Open your Banking App</div>
                  </div>
                </li>
                <li className="flex items-start animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <span className="bg-gradient-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-soft">
                    2
                  </span>
                  <div>
                    <div className="font-medium text-strong-black">เลือกสแกน QR Code</div>
                    <div className="text-xs text-neutral-grey-light">Select Scan QR Code</div>
                  </div>
                </li>
                <li className="flex items-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-gradient-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-soft">
                    3
                  </span>
                  <div>
                    <div className="font-medium text-strong-black">ยืนยันการชำระเงิน</div>
                    <div className="text-xs text-neutral-grey-light">Confirm Payment</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-6">
            {/* Transaction Details */}
            <div className="bg-clean-white rounded-xl p-6">
              <h4 className="font-bold text-strong-black mb-4">
                รายละเอียดการชำระเงิน / Transaction Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-grey">Transaction ID</span>
                  <span className="font-mono text-sm text-strong-black">
                    {transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-grey">จำนวนเงิน / Amount</span>
                  <span className="font-bold text-strong-black">
                    {amount.toFixed(2)} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-grey">วิธีชำระ / Payment Method</span>
                  <span className="text-strong-black">PromptPay</span>
                </div>
              </div>
            </div>

            {/* Payment Status Display */}
            <div className="bg-gradient-to-br from-warning-orange/10 to-warning-orange/20 rounded-xl p-6 border-2 border-warning-orange/30">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-12 w-12 text-warning-orange animate-spin" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-strong-black mb-2">
                  {t.waiting}
                </h4>
                <p className="text-neutral-grey font-roboto">
                  {t.waitingEn}
                </p>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-warning-orange">
                    {countdown}
                  </div>
                  <div className="text-sm text-neutral-grey">
                    {t.timeRemaining} / {t.timeRemainingEn}
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <Button
              onClick={onCancel}
              disabled={isCancelling}
              variant="outline"
              className="w-full bg-neutral-grey hover:bg-neutral-grey/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 border-neutral-grey"
            >
              <X className="w-5 h-5 mr-2" />
              {t.cancel} / {t.cancelEn}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
