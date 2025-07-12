import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Transaction } from "@shared/schema";
import { LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface TransactionHistoryProps {
  language: string;
}

export function TransactionHistory({ language }: TransactionHistoryProps) {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    select: (data: Transaction[]) => data,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success-green" />;
      case "failed":
      case "timeout":
        return <XCircle className="w-5 h-5 text-warning-orange" />;
      case "pending":
        return <Clock className="w-5 h-5 text-neutral-grey animate-spin" />;
      default:
        return <XCircle className="w-5 h-5 text-neutral-grey" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "สำเร็จ / Success";
      case "failed":
        return "ไม่สำเร็จ / Failed";
      case "timeout":
        return "หมดเวลา / Timeout";
      case "pending":
        return "รอดำเนินการ / Pending";
      default:
        return "ไม่ทราบ / Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-success-green";
      case "failed":
      case "timeout":
        return "text-warning-orange";
      case "pending":
        return "text-neutral-grey";
      default:
        return "text-neutral-grey";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-2xl shadow-xl">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-strong-black mb-6">
            {t.transactionHistory} / {t.transactionHistoryEn}
          </h3>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-clean-white rounded-xl border border-neutral-grey/20 animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-neutral-grey/30 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-grey/30 rounded w-24" />
                    <div className="h-3 bg-neutral-grey/20 rounded w-32" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-3 bg-neutral-grey/20 rounded w-24" />
                  <div className="h-4 bg-neutral-grey/30 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-xl">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-strong-black mb-6">
          {t.transactionHistory} / {t.transactionHistoryEn}
        </h3>
        <div className="space-y-4">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-clean-white rounded-xl border border-neutral-grey/20 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-success-green rounded-full flex items-center justify-center">
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div>
                    <div className="font-semibold text-strong-black">
                      {parseFloat(transaction.amount).toFixed(2)} {t.currency}
                    </div>
                    <div className="text-sm text-neutral-grey font-roboto">
                      {new Date(transaction.createdAt).toLocaleString(
                        language === "th" ? "th-TH" : "en-US"
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-grey">
                    {transaction.transactionId}
                  </div>
                  <div className={`font-semibold ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-grey">
              <div className="text-lg mb-2">ไม่มีประวัติการทำรายการ</div>
              <div className="text-sm font-roboto">No transaction history</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
