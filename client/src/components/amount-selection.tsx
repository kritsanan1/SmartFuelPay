import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Loader2 } from "lucide-react";
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
    <Card className="bg-white rounded-2xl shadow-strong hover-lift animate-fade-in">
      <CardContent className="card-mobile">
        <div className="text-center spacing-mobile-sm animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 shadow-medium">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-mobile-title font-bold text-strong-black tracking-tight">
            {t.selectAmount}
          </h2>
          <p className="text-neutral-grey-light text-mobile-body">
            {t.selectAmountEn}
          </p>
        </div>

        <div className="grid-mobile-2 gap-4 sm:gap-6 md:gap-8">
          {/* Amount Input Section */}
          <div className="spacing-mobile-sm">
            <div className="bg-gradient-to-br from-clean-white to-clean-white-warm rounded-xl card-mobile-sm border-2 border-neutral-grey/20 shadow-soft hover-lift">
              <label className="block text-mobile-body font-semibold text-strong-black mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-trust-blue rounded-full"></div>
                กรอกจำนวนเงิน ({t.currency}) / Enter Amount ({t.currency})
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="w-full text-2xl sm:text-3xl md:text-4xl font-bold text-center py-4 sm:py-5 px-4 sm:px-6 border-2 border-neutral-grey/30 rounded-xl focus:border-trust-blue focus:ring-2 focus:ring-trust-blue/20 bg-white touch-target form-mobile transition-all duration-200 shadow-soft hover:shadow-medium"
                  min="50"
                  max="5000"
                  step="0.01"
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-trust-blue text-lg sm:text-xl font-bold">
                  ฿
                </div>
              </div>
              <div className="text-mobile-caption text-neutral-grey mt-2 text-center font-roboto">
                Minimum: 50 THB | Maximum: 5,000 THB
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="spacing-mobile-xs">
              <h3 className="text-mobile-body font-semibold text-strong-black">
                จำนวนเงินยอดนิยม / Popular Amounts
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {QUICK_AMOUNTS.map((amount, index) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className={`btn-mobile py-4 sm:py-5 px-3 sm:px-6 font-bold text-lg sm:text-xl rounded-xl border-2 transition-all duration-300 transform hover-lift press-effect focus-ring animate-scale-in shadow-soft ${
                      selectedQuickAmount === amount
                        ? "bg-gradient-primary text-white border-trust-blue shadow-medium"
                        : "bg-gradient-to-br from-white to-clean-white border-neutral-grey/30 hover:bg-gradient-primary hover:text-white hover:border-trust-blue hover:shadow-medium"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleQuickAmountSelect(amount)}
                  >
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{amount.toLocaleString()}</div>
                      <div className="text-xs sm:text-sm opacity-75 font-medium">{t.currency}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Summary Section */}
          <div className="bg-gradient-to-br from-trust-blue/5 to-trust-blue/10 rounded-xl p-6 shadow-soft border border-trust-blue/10 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
              <h3 className="text-xl font-bold text-strong-black tracking-tight">
                {t.orderSummary} / {t.orderSummaryEn}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-soft">
                <span className="text-neutral-grey font-medium">ประเภทเชื้อเพลิง / Fuel Type</span>
                <span className="font-semibold text-strong-black bg-trust-blue/10 px-3 py-1 rounded-full text-sm">{fuelType}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-soft">
                <span className="text-neutral-grey font-medium">ราคาต่อลิตร / Price per Liter</span>
                <span className="font-semibold text-strong-black">
                  {pricePerLiter.toFixed(2)} {t.currency}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-soft">
                <span className="text-neutral-grey font-medium">ปริมาณโดยประมาณ / Estimated Volume</span>
                <span className="font-semibold text-strong-black">
                  {estimatedVolume.toFixed(2)} L
                </span>
              </div>
              <div className="bg-gradient-to-r from-trust-blue/10 to-trust-blue/5 rounded-lg p-4 shadow-soft">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-strong-black">
                    ยอดรวม / Total Amount
                  </span>
                  <span className="text-2xl font-bold text-trust-blue">
                    {selectedAmount.toFixed(2)} {t.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Generate QR Button */}
            <Button
              onClick={onGenerateQR}
              disabled={!isValidAmount || isGenerating}
              className="w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-trust-blue-dark hover:to-trust-blue text-white font-bold py-5 px-6 rounded-xl mt-6 transition-all duration-300 text-xl h-auto shadow-medium hover:shadow-strong hover-lift press-effect focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              ) : (
                <QrCode className="w-6 h-6 mr-3" />
              )}
              <div className="text-center">
                <div>{isGenerating ? 'กำลังสร้าง QR...' : t.generateQR}</div>
                <div className="text-sm opacity-90 font-medium">
                  {isGenerating ? 'Generating QR...' : t.generateQREn}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
