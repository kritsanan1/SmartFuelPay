import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { QUICK_AMOUNTS, FUEL_TYPES, PRICE_PER_LITER, LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface AmountSelectionProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
  onGenerateQR: () => void;
  isGenerating: boolean;
  language: string;
}

export function AmountSelection({
  selectedAmount,
  onAmountChange,
  onGenerateQR,
  isGenerating,
  language,
}: AmountSelectionProps) {
  const [customAmount, setCustomAmount] = useState(selectedAmount?.toString() || "");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];
  const fuelType = FUEL_TYPES.GASOHOL_95;
  const pricePerLiter = PRICE_PER_LITER[fuelType];
  const estimatedVolume = selectedAmount / pricePerLiter;

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value) || 0;
    onAmountChange(amount);
    setSelectedQuickAmount(null);
  };

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedQuickAmount(amount);
    setCustomAmount(amount.toString());
    onAmountChange(amount);
  };

  const isValidAmount = selectedAmount >= 50 && selectedAmount <= 5000;

  return (
    <Card className="bg-white rounded-2xl shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-strong-black mb-2">
            {t.selectAmount}
          </h2>
          <p className="text-neutral-grey font-roboto text-lg">
            {t.selectAmountEn}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Amount Input Section */}
          <div className="space-y-6">
            <div className="bg-clean-white rounded-xl p-6 border-2 border-neutral-grey/20">
              <label className="block text-lg font-semibold text-strong-black mb-3">
                กรอกจำนวนเงิน ({t.currency}) / Enter Amount ({t.currency})
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="w-full text-4xl font-bold text-center py-4 px-6 border-2 border-neutral-grey/30 rounded-xl focus:border-trust-blue bg-white h-auto"
                  min="50"
                  max="5000"
                  step="0.01"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-grey text-xl">
                  ฿
                </div>
              </div>
              <div className="text-sm text-neutral-grey mt-2 text-center font-roboto">
                Minimum: 50 THB | Maximum: 5,000 THB
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-strong-black">
                จำนวนเงินยอดนิยม / Popular Amounts
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className={`h-auto py-4 px-6 font-bold text-xl rounded-xl border-2 transition-all duration-200 ${
                      selectedQuickAmount === amount
                        ? "bg-trust-blue text-white border-trust-blue hover:bg-trust-blue/90"
                        : "bg-clean-white border-neutral-grey/30 hover:bg-trust-blue hover:text-white hover:border-trust-blue"
                    }`}
                    onClick={() => handleQuickAmountSelect(amount)}
                  >
                    <div className="text-center">
                      <div className="text-2xl">{amount.toLocaleString()}</div>
                      <div className="text-sm opacity-75">{t.currency}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gradient-to-br from-trust-blue/5 to-trust-blue/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-strong-black mb-4">
              {t.orderSummary} / {t.orderSummaryEn}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-grey">ประเภทเชื้อเพลิง / Fuel Type</span>
                <span className="font-semibold text-strong-black">{fuelType}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-grey">ราคาต่อลิตร / Price per Liter</span>
                <span className="font-semibold text-strong-black">
                  {pricePerLiter.toFixed(2)} {t.currency}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-grey">ปริมาณโดยประมาณ / Estimated Volume</span>
                <span className="font-semibold text-strong-black">
                  {estimatedVolume.toFixed(2)} L
                </span>
              </div>
              <hr className="border-neutral-grey/30" />
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-strong-black">
                  ยอดรวม / Total Amount
                </span>
                <span className="text-2xl font-bold text-trust-blue">
                  {selectedAmount.toFixed(2)} {t.currency}
                </span>
              </div>
            </div>

            {/* Generate QR Button */}
            <Button
              onClick={onGenerateQR}
              disabled={!isValidAmount || isGenerating}
              className="w-full bg-trust-blue hover:bg-trust-blue/90 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-all duration-200 text-xl h-auto"
            >
              <QrCode className="w-6 h-6 mr-3" />
              <div className="text-center">
                <div>{t.generateQR}</div>
                <div className="text-sm opacity-90 font-roboto">
                  {t.generateQREn}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
