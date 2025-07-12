import { Check } from "lucide-react";
import { LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface ProgressStepsProps {
  currentStep: number;
  language: string;
}

export function ProgressSteps({ currentStep, language }: ProgressStepsProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  const steps = [
    {
      number: 1,
      title: t.selectAmount,
      subtitle: t.selectAmountEn,
    },
    {
      number: 2,
      title: t.scanQR,
      subtitle: t.scanQREn,
    },
    {
      number: 3,
      title: t.dispense,
      subtitle: t.dispenseEn,
    },
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                currentStep > step.number
                  ? "bg-success-green text-white"
                  : currentStep === step.number
                  ? "bg-trust-blue text-white"
                  : "bg-neutral-grey text-white"
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3">
              <div
                className={`font-semibold ${
                  currentStep >= step.number
                    ? currentStep > step.number
                      ? "text-success-green"
                      : "text-strong-black"
                    : "text-neutral-grey"
                }`}
              >
                {step.title}
              </div>
              <div className="text-sm text-neutral-grey font-roboto">
                {step.subtitle}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 rounded mx-4 ${
                currentStep > step.number ? "bg-success-green" : "bg-neutral-grey"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
