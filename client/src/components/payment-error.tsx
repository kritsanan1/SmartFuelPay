import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface PaymentErrorProps {
  onRetry: () => void;
  onBackToAmount: () => void;
  language: string;
}

export function PaymentError({
  onRetry,
  onBackToAmount,
  language,
}: PaymentErrorProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  return (
    <Card className="bg-white rounded-2xl shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-warning-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-strong-black mb-2">
            {t.paymentFailed}
          </h2>
          <p className="text-neutral-grey font-roboto text-lg">
            {t.paymentFailedEn}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-warning-orange/10 rounded-xl p-6 border-2 border-warning-orange/30 mb-6">
            <h4 className="font-bold text-strong-black mb-3">
              สาเหตุที่เป็นไปได้ / Possible Causes
            </h4>
            <ul className="text-neutral-grey space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning-orange rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>ยอดเงินในบัญชีไม่เพียงพอ / Insufficient account balance</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning-orange rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>เครือข่ายขัดข้อง / Network connection issues</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning-orange rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>หมดเวลาการชำระเงิน / Payment timeout</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning-orange rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>ข้อมูลการชำระเงินไม่ถูกต้อง / Invalid payment information</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onRetry}
              className="flex-1 bg-trust-blue hover:bg-trust-blue/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {t.retry} / {t.retryEn}
            </Button>
            <Button
              onClick={onBackToAmount}
              variant="outline"
              className="flex-1 bg-neutral-grey hover:bg-neutral-grey/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 border-neutral-grey"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              เลือกจำนวนเงินใหม่ / Select New Amount
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
