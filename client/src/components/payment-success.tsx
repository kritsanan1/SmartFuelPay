import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus } from "lucide-react";
import { LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface PaymentSuccessProps {
  transactionId: string;
  amount: number;
  timestamp: string;
  onNewTransaction: () => void;
  language: string;
}

export function PaymentSuccess({
  transactionId,
  amount,
  timestamp,
  onNewTransaction,
  language,
}: PaymentSuccessProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  return (
    <Card className="bg-white rounded-2xl shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-success-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-strong-black mb-2">
            {t.paymentSuccess}
          </h2>
          <p className="text-neutral-grey font-roboto text-lg">
            {t.paymentSuccessEn}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Receipt */}
          <div className="bg-clean-white rounded-xl p-6">
            <h4 className="font-bold text-strong-black mb-4">
              ใบเสร็จรับเงิน / Receipt
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-grey">วันที่ / Date</span>
                <span className="text-strong-black">{timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-grey">หัวจ่าย / Pump</span>
                <span className="text-strong-black">03</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-grey">ยอดชำระ / Amount Paid</span>
                <span className="font-bold text-success-green">
                  {amount.toFixed(2)} {t.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-grey">Transaction ID</span>
                <span className="font-mono text-sm text-strong-black">
                  {transactionId}
                </span>
              </div>
              <hr className="border-neutral-grey/30" />
              <div className="flex justify-between">
                <span className="text-neutral-grey">สถานะ / Status</span>
                <span className="text-success-green font-bold">
                  ✓ สำเร็จ / Success
                </span>
              </div>
            </div>
          </div>

          {/* Fuel Dispensing Instructions */}
          <div className="bg-gradient-to-br from-success-green/10 to-success-green/20 rounded-xl p-6 border-2 border-success-green/30">
            <h4 className="font-bold text-strong-black mb-4">
              คำแนะนำการจ่ายน้ำมัน
            </h4>
            <p className="text-neutral-grey font-roboto mb-4">
              Fuel Dispensing Instructions
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-success-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </div>
                <span className="text-strong-black">ยกหัวจ่ายน้ำมันขึ้น</span>
              </div>
              <div className="flex items-start">
                <div className="bg-success-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </div>
                <span className="text-strong-black">ใส่หัวจ่ายเข้าถังน้ำมัน</span>
              </div>
              <div className="flex items-start">
                <div className="bg-success-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </div>
                <span className="text-strong-black">กดปุ่มเริ่มจ่าย</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-success-green/20 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="text-success-green font-bold text-lg">
                  หัวจ่ายพร้อมใช้งาน
                </div>
              </div>
              <div className="text-center text-sm text-neutral-grey font-roboto mt-1">
                Pump is ready for use
              </div>
            </div>
          </div>
        </div>

        {/* New Transaction Button */}
        <div className="text-center mt-8">
          <Button
            onClick={onNewTransaction}
            className="bg-trust-blue hover:bg-trust-blue/90 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg h-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.newTransaction} / {t.newTransactionEn}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
