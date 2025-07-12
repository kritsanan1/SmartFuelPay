import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PAYMENT_STATUS, PAYMENT_TIMEOUT } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface QRCodeResponse {
  transactionId: string;
  qrCodeData: string;
  amount: number;
  estimatedVolume: string;
  expiresIn: number;
}

interface PaymentStatusResponse {
  status: string;
}

export function usePayment() {
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(PAYMENT_TIMEOUT);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Generate QR Code mutation
  const generateQRMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/generate-qr", { amount });
      return response.json() as Promise<QRCodeResponse>;
    },
    onSuccess: (data) => {
      setCurrentTransactionId(data.transactionId);
      setCountdown(data.expiresIn);
      setIsCountdownActive(true);
      toast({
        title: "QR Code Generated",
        description: `Transaction ID: ${data.transactionId}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Payment status query
  const paymentStatusQuery = useQuery({
    queryKey: ["/api/payment-status", currentTransactionId],
    enabled: !!currentTransactionId && isCountdownActive,
    refetchInterval: 2000, // Poll every 2 seconds
    select: (data: PaymentStatusResponse) => data.status,
  });

  // Cancel payment mutation
  const cancelPaymentMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiRequest("POST", `/api/cancel-transaction/${transactionId}`);
      return response.json();
    },
    onSuccess: () => {
      setCurrentTransactionId(null);
      setIsCountdownActive(false);
      setCountdown(PAYMENT_TIMEOUT);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Payment Cancelled",
        description: "Transaction has been cancelled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (!isCountdownActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsCountdownActive(false);
          setCurrentTransactionId(null);
          toast({
            title: "Payment Timeout",
            description: "Payment session has expired. Please try again.",
            variant: "destructive",
          });
          return PAYMENT_TIMEOUT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdownActive, toast]);

  // Handle payment status changes
  useEffect(() => {
    if (!paymentStatusQuery.data) return;

    const status = paymentStatusQuery.data;
    
    if (status === PAYMENT_STATUS.SUCCESS) {
      setIsCountdownActive(false);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed successfully.",
      });
    } else if (status === PAYMENT_STATUS.FAILED || status === PAYMENT_STATUS.TIMEOUT) {
      setIsCountdownActive(false);
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive",
      });
    }
  }, [paymentStatusQuery.data, queryClient, toast]);

  const generateQR = useCallback((amount: number) => {
    generateQRMutation.mutate(amount);
  }, [generateQRMutation]);

  const cancelPayment = useCallback(() => {
    if (currentTransactionId) {
      cancelPaymentMutation.mutate(currentTransactionId);
    }
  }, [currentTransactionId, cancelPaymentMutation]);

  const resetPayment = useCallback(() => {
    setCurrentTransactionId(null);
    setIsCountdownActive(false);
    setCountdown(PAYMENT_TIMEOUT);
    queryClient.removeQueries({ queryKey: ["/api/payment-status"] });
  }, [queryClient]);

  const formatCountdown = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    currentTransactionId,
    countdown,
    isCountdownActive,
    paymentStatus: paymentStatusQuery.data,
    
    // Loading states
    isGeneratingQR: generateQRMutation.isPending,
    isCancellingPayment: cancelPaymentMutation.isPending,
    isCheckingStatus: paymentStatusQuery.isLoading,
    
    // Data
    qrData: generateQRMutation.data,
    
    // Actions
    generateQR,
    cancelPayment,
    resetPayment,
    
    // Helpers
    formatCountdown,
  };
}
