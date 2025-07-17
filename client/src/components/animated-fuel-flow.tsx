import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedFuelFlowProps {
  isActive: boolean;
  flowRate: number; // 0-100
  fuelType: "gasohol95" | "gasohol91" | "diesel" | "premium";
  direction?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
}

export default function AnimatedFuelFlow({ 
  isActive, 
  flowRate, 
  fuelType, 
  direction = "vertical",
  size = "md" 
}: AnimatedFuelFlowProps) {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive && flowRate > 0) {
      // Generate particles based on flow rate
      const particleCount = Math.max(3, Math.floor(flowRate / 20));
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        delay: i * (1000 / particleCount), // Stagger animations
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, flowRate]);

  const getFuelColor = () => {
    switch (fuelType) {
      case "gasohol95": return "bg-green-500";
      case "gasohol91": return "bg-blue-500";
      case "diesel": return "bg-yellow-600";
      case "premium": return "bg-purple-500";
      default: return "bg-blue-500";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return direction === "vertical" ? "w-2 h-32" : "w-32 h-2";
      case "md": return direction === "vertical" ? "w-4 h-48" : "w-48 h-4";
      case "lg": return direction === "vertical" ? "w-6 h-64" : "w-64 h-6";
      default: return direction === "vertical" ? "w-4 h-48" : "w-48 h-4";
    }
  };

  const getParticleSize = () => {
    switch (size) {
      case "sm": return "w-1 h-4";
      case "md": return "w-2 h-6";
      case "lg": return "w-3 h-8";
      default: return "w-2 h-6";
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-full border-2 border-gray-300", getSizeClasses())}>
      {/* Pipe background */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800" />
      
      {/* Fuel particles */}
      {isActive && particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "absolute rounded-full opacity-80",
            getFuelColor(),
            getParticleSize(),
            direction === "vertical" ? "left-1/2 transform -translate-x-1/2" : "top-1/2 transform -translate-y-1/2"
          )}
          style={{
            animation: direction === "vertical" 
              ? `flowVertical ${2000 / Math.max(flowRate / 20, 1)}ms infinite linear`
              : `flowHorizontal ${2000 / Math.max(flowRate / 20, 1)}ms infinite linear`,
            animationDelay: `${particle.delay}ms`,
          }}
        />
      ))}

      {/* Flow indicator bars */}
      {isActive && (
        <>
          <div
            className={cn(
              "absolute opacity-30",
              getFuelColor(),
              direction === "vertical" ? "w-full bottom-0" : "h-full left-0"
            )}
            style={{
              [direction === "vertical" ? "height" : "width"]: `${flowRate}%`,
              transition: "all 0.3s ease-in-out",
            }}
          />
          
          {/* Animated shimmer effect */}
          <div
            className={cn(
              "absolute bg-gradient-to-r from-transparent via-white to-transparent opacity-40",
              direction === "vertical" ? "w-full h-4" : "h-full w-4"
            )}
            style={{
              animation: direction === "vertical"
                ? `shimmerVertical ${1500 / Math.max(flowRate / 30, 1)}ms infinite linear`
                : `shimmerHorizontal ${1500 / Math.max(flowRate / 30, 1)}ms infinite linear`,
            }}
          />
        </>
      )}

      {/* CSS Animations */}
      <style suppressHydrationWarning={true}>{`
        @keyframes flowVertical {
          0% {
            top: -20px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        @keyframes flowHorizontal {
          0% {
            left: -20px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }

        @keyframes shimmerVertical {
          0% {
            top: -20px;
          }
          100% {
            top: 100%;
          }
        }

        @keyframes shimmerHorizontal {
          0% {
            left: -20px;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Pump visualization component with flowing animations
interface PumpVisualizationProps {
  isDispensing: boolean;
  flowRate: number;
  fuelType: "gasohol95" | "gasohol91" | "diesel" | "premium";
  targetAmount: number;
  dispensedAmount: number;
}

export function PumpVisualization({ 
  isDispensing, 
  flowRate, 
  fuelType, 
  targetAmount, 
  dispensedAmount 
}: PumpVisualizationProps) {
  const completionPercentage = (dispensedAmount / targetAmount) * 100;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Pump illustration */}
      <svg
        viewBox="0 0 200 300"
        className="w-full h-64"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pump body */}
        <rect
          x="60"
          y="50"
          width="80"
          height="150"
          rx="10"
          className="fill-gray-300 stroke-gray-400 stroke-2"
        />
        
        {/* Display screen */}
        <rect
          x="70"
          y="70"
          width="60"
          height="40"
          rx="5"
          className="fill-gray-800"
        />
        
        {/* Fuel hose */}
        <path
          d="M 140 120 Q 160 120 160 140 L 160 200 Q 160 220 180 220"
          className="stroke-gray-600 stroke-4 fill-none"
        />
        
        {/* Nozzle */}
        <circle
          cx="180"
          cy="220"
          r="8"
          className="fill-gray-500 stroke-gray-600 stroke-2"
        />
        
        {/* Fuel tank indicator */}
        <rect
          x="75"
          y="140"
          width="50"
          height="40"
          rx="5"
          className="fill-gray-200 stroke-gray-400 stroke-1"
        />
        
        {/* Animated fuel level in tank */}
        <rect
          x="77"
          y={180 - (completionPercentage * 0.36)}
          width="46"
          height={completionPercentage * 0.36}
          rx="3"
          className={cn(
            "transition-all duration-300",
            fuelType === "gasohol95" && "fill-green-500",
            fuelType === "gasohol91" && "fill-blue-500",
            fuelType === "diesel" && "fill-yellow-600",
            fuelType === "premium" && "fill-purple-500"
          )}
        />
      </svg>

      {/* Flowing animation in hose */}
      <div className="absolute top-20 left-32">
        <AnimatedFuelFlow
          isActive={isDispensing}
          flowRate={flowRate}
          fuelType={fuelType}
          direction="vertical"
          size="sm"
        />
      </div>

      {/* Status indicators */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <div className={cn(
          "w-3 h-3 rounded-full",
          isDispensing ? "bg-green-500 animate-pulse" : "bg-gray-400"
        )} />
        <span className="text-sm font-medium">
          {isDispensing ? "กำลังจ่ายน้ำมัน" : "พร้อมใช้งาน"}
        </span>
      </div>

      {/* Progress display */}
      {isDispensing && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span>ความคืบหน้า</span>
            <span>{completionPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                fuelType === "gasohol95" && "bg-green-500",
                fuelType === "gasohol91" && "bg-blue-500",
                fuelType === "diesel" && "bg-yellow-600",
                fuelType === "premium" && "bg-purple-500"
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>฿{dispensedAmount.toFixed(2)}</span>
            <span>฿{targetAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}