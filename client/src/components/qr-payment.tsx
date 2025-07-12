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
    <Card className="bg-white rounded-2xl shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-strong-black mb-2">
            {t.scanQR}
          </h2>
          <p className="text-neutral-grey font-roboto text-lg">
            {t.scanQREn}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-4 border-trust-blue/20">
              <QRCode data={qrData} size={256} />
            </div>

            {/* Payment Instructions */}
            <div className="bg-clean-white rounded-xl p-6 max-w-md">
              <h4 className="font-bold text-strong-black mb-3">
                วิธีชำระเงิน / Payment Instructions
              </h4>
              <ol className="text-sm text-neutral-grey space-y-2">
                <li className="flex items-start">
                  <span className="bg-trust-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    1
                  </span>
                  <span>เปิดแอป Mobile Banking</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-trust-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    2
                  </span>
                  <span>เลือกสแกน QR Code</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-trust-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    3
                  </span>
                  <span>ยืนยันการชำระเงิน</span>
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
