/**
 * Transfer Deadline Countdown Component
 * Displays countdown timer and transfer window status
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineCountdownProps {
  deadline: Date | null;
  isOpen: boolean;
  gameweekNumber?: number;
}

export default function TransferDeadlineCountdown({
  deadline,
  isOpen,
  gameweekNumber,
}: DeadlineCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    formatted: string;
  } | null>(null);

  const [status, setStatus] = useState<"open" | "approaching" | "critical" | "closed">(
    isOpen ? "open" : "closed"
  );

  useEffect(() => {
    if (!deadline) return;

    const updateCountdown = () => {
      const now = new Date();
      const remaining = deadline.getTime() - now.getTime();

      if (remaining <= 0) {
        setStatus("closed");
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          formatted: "انتهى",
        });
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Determine status
      if (minutes <= 15 && minutes > 0) {
        setStatus("critical");
      } else if (hours <= 1 && minutes > 0) {
        setStatus("approaching");
      } else {
        setStatus("open");
      }

      // Format time
      let formatted = "";
      if (days > 0) {
        formatted = `${days} يوم و ${hours} ساعة`;
      } else if (hours > 0) {
        formatted = `${hours} ساعة و ${minutes} دقيقة`;
      } else if (minutes > 0) {
        formatted = `${minutes} دقيقة و ${seconds} ثانية`;
      } else {
        formatted = `${seconds} ثانية`;
      }

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: totalSeconds,
        formatted,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || !timeRemaining) {
    return null;
  }

  const statusConfig = {
    open: {
      color: "bg-green-50 border-green-200",
      icon: CheckCircle2,
      iconColor: "text-green-600",
      title: "نافذة الانتقالات مفتوحة",
      severity: "info",
    },
    approaching: {
      color: "bg-yellow-50 border-yellow-200",
      icon: Clock,
      iconColor: "text-yellow-600",
      title: "نافذة الانتقالات تقترب من الإغلاق",
      severity: "warning",
    },
    critical: {
      color: "bg-red-50 border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600",
      title: "نافذة الانتقالات ستغلق قريباً جداً",
      severity: "critical",
    },
    closed: {
      color: "bg-gray-50 border-gray-200",
      icon: XCircle,
      iconColor: "text-gray-600",
      title: "نافذة الانتقالات مغلقة",
      severity: "info",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn("border", config.color)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", config.iconColor)} />
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              {gameweekNumber && (
                <CardDescription>الأسبوع {gameweekNumber}</CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Countdown Display */}
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground mb-2">الوقت المتبقي</p>
          <p className="text-3xl font-bold text-center font-mono">
            {timeRemaining.formatted}
          </p>
        </div>

        {/* Time Breakdown */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 text-center border">
            <p className="text-2xl font-bold">{timeRemaining.days}</p>
            <p className="text-xs text-muted-foreground">يوم</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <p className="text-2xl font-bold">{timeRemaining.hours}</p>
            <p className="text-xs text-muted-foreground">ساعة</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <p className="text-2xl font-bold">{timeRemaining.minutes}</p>
            <p className="text-xs text-muted-foreground">دقيقة</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border">
            <p className="text-2xl font-bold">{timeRemaining.seconds}</p>
            <p className="text-xs text-muted-foreground">ثانية</p>
          </div>
        </div>

        {/* Status Alert */}
        {status === "critical" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              ⚠️ تحذير: نافذة الانتقالات ستغلق خلال دقائق قليلة! تأكد من إكمال انتقالاتك الآن.
            </AlertDescription>
          </Alert>
        )}

        {status === "approaching" && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              تنبيه: نافذة الانتقالات ستغلق قريباً. تأكد من إكمال جميع الانتقالات المطلوبة.
            </AlertDescription>
          </Alert>
        )}

        {status === "closed" && (
          <Alert className="border-gray-200 bg-gray-50">
            <XCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-800">
              نافذة الانتقالات مغلقة حالياً. سيتم فتح نافذة جديدة للأسبوع القادم.
            </AlertDescription>
          </Alert>
        )}

        {status === "open" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✓ يمكنك إجراء الانتقالات بحرية. لديك وقت كافي قبل إغلاق النافذة.
            </AlertDescription>
          </Alert>
        )}

        {/* Deadline Info */}
        <div className="bg-white rounded-lg p-3 border text-sm">
          <p className="text-muted-foreground">
            الموعد النهائي: <span className="font-semibold text-foreground">
              {deadline.toLocaleString("ar-LY", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
