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
    <div className="bg-white rounded-2xl shadow-soft p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center min-w-0 flex-shrink-0">
            <div className="flex items-center">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-medium transition-all duration-300 ${
                    currentStep > step.number
                      ? "bg-gradient-success text-white animate-scale-in"
                      : currentStep === step.number
                      ? "bg-gradient-primary text-white animate-pulse"
                      : "bg-neutral-grey-light text-white"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                {currentStep === step.number && (
                  <div className="absolute -inset-1 bg-trust-blue/20 rounded-full animate-ping"></div>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div
                  className={`font-semibold text-sm transition-colors duration-200 ${
                    currentStep >= step.number
                      ? currentStep > step.number
                        ? "text-success-green"
                        : "text-strong-black"
                      : "text-neutral-grey"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-neutral-grey-light">
                  {step.subtitle}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="relative mx-4">
                <div className="w-12 sm:w-16 h-1 bg-neutral-grey-light rounded-full">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentStep > step.number ? "w-full bg-gradient-success" : "w-0 bg-trust-blue"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile step indicators */}
      <div className="flex justify-center mt-4 sm:hidden">
        <div className="text-center">
          <div className="text-lg font-bold text-strong-black">
            {steps[currentStep - 1]?.title}
          </div>
          <div className="text-sm text-neutral-grey-light">
            {steps[currentStep - 1]?.subtitle}
          </div>
          <div className="text-xs text-neutral-grey mt-1">
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}
