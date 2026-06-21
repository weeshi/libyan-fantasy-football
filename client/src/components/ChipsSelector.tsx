/**
 * Chips Selector Component
 * Display and manage available chips for the user
 */

import { useState, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Users, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface Chip {
  type: string;
  name: string;
  description: string;
  isUsed: boolean;
  usedInGameweek?: number;
}

interface ChipsSelectorProps {
  availableChips: Chip[];
  activeChip: string | null;
  onUseChip: (chipType: string) => Promise<void>;
  isLoading?: boolean;
}

function ChipsSelectorComponent({
  availableChips,
  activeChip,
  onUseChip,
  isLoading = false,
}: ChipsSelectorProps) {
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chipIcons: Record<string, React.ReactNode> = {
    TRIPLE_CAPTAIN: <Zap className="w-5 h-5" />,
    WILDCARD: <Sparkles className="w-5 h-5" />,
    BENCH_BOOST: <Users className="w-5 h-5" />,
    FREE_HIT: <Shield className="w-5 h-5" />,
  };

  const chipColors: Record<string, string> = {
    TRIPLE_CAPTAIN: "bg-red-50 border-red-200 hover:bg-red-100",
    WILDCARD: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    BENCH_BOOST: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    FREE_HIT: "bg-green-50 border-green-200 hover:bg-green-100",
  };

  const chipTextColors: Record<string, string> = {
    TRIPLE_CAPTAIN: "text-red-600",
    WILDCARD: "text-purple-600",
    BENCH_BOOST: "text-blue-600",
    FREE_HIT: "text-green-600",
  };

  const handleUseChip = async () => {
    if (!selectedChip) return;

    setIsSubmitting(true);
    try {
      await onUseChip(selectedChip);
      setShowConfirmDialog(false);
      setSelectedChip(null);
    } catch (error) {
      console.error("Failed to use chip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unusedChips = availableChips.filter((c) => !c.isUsed);
  const usedChips = availableChips.filter((c) => c.isUsed);

  return (
    <div className="space-y-6">
      {/* Active Chip Display */}
      {activeChip && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✓ الرقاقة النشطة حالياً: <span className="font-semibold">{activeChip}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Available Chips */}
      <div>
        <h3 className="text-lg font-semibold mb-4">الرقائق المتاحة</h3>
        {unusedChips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unusedChips.map((chip) => (
              <Card
                key={chip.type}
                className={`border-2 cursor-pointer transition-all ${chipColors[chip.type]}`}
                onClick={() => {
                  setSelectedChip(chip.type);
                  setShowConfirmDialog(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`${chipTextColors[chip.type]} mt-1`}>
                        {chipIcons[chip.type]}
                      </div>
                      <div>
                        <CardTitle className="text-base">{chip.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {chip.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">متاح</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChip(chip.type);
                      setShowConfirmDialog(true);
                    }}
                    className="w-full"
                    disabled={isLoading}
                  >
                    استخدم الآن
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لا توجد رقائق متاحة. تم استخدام جميع الرقائق المتاحة هذا الموسم.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Used Chips */}
      {usedChips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">الرقائق المستخدمة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usedChips.map((chip) => (
              <Card key={chip.type} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400 mt-1">{chipIcons[chip.type]}</div>
                      <div>
                        <CardTitle className="text-base text-gray-600">
                          {chip.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {chip.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">مستخدمة</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    تم استخدامها في الأسبوع {chip.usedInGameweek}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد استخدام الرقاقة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في استخدام هذه الرقاقة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>

          {selectedChip && (
            <div className={`p-4 rounded-lg border-2 ${chipColors[selectedChip]}`}>
              <div className="flex items-start gap-3">
                <div className={`${chipTextColors[selectedChip]}`}>
                  {chipIcons[selectedChip]}
                </div>
                <div>
                  <p className="font-semibold">
                    {availableChips.find((c) => c.type === selectedChip)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {availableChips.find((c) => c.type === selectedChip)?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning for last chip */}
          {unusedChips.length === 1 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                ⚠️ تحذير: هذه آخر رقاقة متاحة من هذا النوع هذا الموسم.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUseChip}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "جاري الاستخدام..." : "تأكيد الاستخدام"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">معلومات الرقائق</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" />
              الكابتن الثلاثي
            </p>
            <p className="text-muted-foreground">مضاعفة نقاط الكابتن 3 مرات (مرة واحدة فقط)</p>
          </div>
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              البطاقة البرية
            </p>
            <p className="text-muted-foreground">تغيير الفريق بالكامل بدون عقوبة (مرتان)</p>
          </div>
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              تعزيز البدلاء
            </p>
            <p className="text-muted-foreground">استخدام جميع لاعبي البدلاء (مرة واحدة فقط)</p>
          </div>
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              الضربة الحرة
            </p>
            <p className="text-muted-foreground">تغيير مؤقت للفريق (يعود بعد الأسبوع)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(ChipsSelectorComponent);
