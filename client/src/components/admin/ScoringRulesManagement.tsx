/**
 * Scoring Rules Management Component
 * Allows admins to view and modify scoring rules
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Save, RotateCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ScoringRule {
  id: number;
  ruleType: string;
  position: string;
  points: number;
  description?: string;
  isActive: number;
}

export default function ScoringRulesManagement() {
  const { toast } = useToast();
  const [rules, setRules] = useState<ScoringRule[]>([
    // Default FPL-style rules
    { id: 1, ruleType: "minutesPlayedThreshold", position: "all", points: 60, description: "الحد الأدنى للدقائق", isActive: 1 },
    { id: 2, ruleType: "pointsPerMinute", position: "all", points: 1, description: "نقطة واحدة لكل دقيقة", isActive: 1 },
    { id: 3, ruleType: "goalsGoalkeeper", position: "goalkeeper", points: 10, description: "أهداف الحارس", isActive: 1 },
    { id: 4, ruleType: "goalsDefender", position: "defender", points: 6, description: "أهداف المدافع", isActive: 1 },
    { id: 5, ruleType: "goalsMidfielder", position: "midfielder", points: 5, description: "أهداف الوسط", isActive: 1 },
    { id: 6, ruleType: "goalsForward", position: "forward", points: 4, description: "أهداف المهاجم", isActive: 1 },
    { id: 7, ruleType: "assistsPoints", position: "all", points: 3, description: "التمريرات الحاسمة", isActive: 1 },
    { id: 8, ruleType: "cleanSheetGoalkeeper", position: "goalkeeper", points: 4, description: "ورقة نظيفة - حارس", isActive: 1 },
    { id: 9, ruleType: "cleanSheetDefender", position: "defender", points: 4, description: "ورقة نظيفة - مدافع", isActive: 1 },
    { id: 10, ruleType: "cleanSheetMidfielder", position: "midfielder", points: 1, description: "ورقة نظيفة - وسط", isActive: 1 },
    { id: 11, ruleType: "savesThreshold", position: "goalkeeper", points: 3, description: "إنقاذ واحد لكل 3 إنقاذات", isActive: 1 },
    { id: 12, ruleType: "yellowCardPenalty", position: "all", points: -1, description: "عقوبة البطاقة الصفراء", isActive: 1 },
    { id: 13, ruleType: "redCardPenalty", position: "all", points: -3, description: "عقوبة البطاقة الحمراء", isActive: 1 },
    { id: 14, ruleType: "goalsAgainstThreshold", position: "all", points: 2, description: "عقوبة لكل هدفين", isActive: 1 },
    { id: 15, ruleType: "goalsAgainstPenalty", position: "all", points: -1, description: "عقوبة الأهداف المستقبلة", isActive: 1 },
    { id: 16, ruleType: "ownGoalPenalty", position: "all", points: -2, description: "عقوبة الهدف الضد", isActive: 1 },
    { id: 17, ruleType: "penaltyMissedPenalty", position: "all", points: -2, description: "عقوبة الركلة الضائعة", isActive: 1 },
    { id: 18, ruleType: "bonusPointsMultiplier", position: "all", points: 1, description: "مضاعف النقاط الإضافية", isActive: 1 },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEdit = (rule: ScoringRule) => {
    setEditingId(rule.id);
    setEditValue(rule.points);
  };

  const handleSave = (id: number) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, points: editValue } : rule
      )
    );
    setEditingId(null);
    toast({
      title: "نجح",
      description: "تم تحديث قاعدة النقاط بنجاح",
    });
  };

  const handleReset = () => {
    if (!confirm("هل تريد إعادة تعيين جميع القواعس إلى القيم الافتراضية؟")) return;

    // Reset to defaults
    const defaults: ScoringRule[] = [
      { id: 1, ruleType: "minutesPlayedThreshold", position: "all", points: 60, description: "الحد الأدنى للدقائق", isActive: 1 },
      { id: 2, ruleType: "pointsPerMinute", position: "all", points: 1, description: "نقطة واحدة لكل دقيقة", isActive: 1 },
      { id: 3, ruleType: "goalsGoalkeeper", position: "goalkeeper", points: 10, description: "أهداف الحارس", isActive: 1 },
      { id: 4, ruleType: "goalsDefender", position: "defender", points: 6, description: "أهداف المدافع", isActive: 1 },
      { id: 5, ruleType: "goalsMidfielder", position: "midfielder", points: 5, description: "أهداف الوسط", isActive: 1 },
      { id: 6, ruleType: "goalsForward", position: "forward", points: 4, description: "أهداف المهاجم", isActive: 1 },
      { id: 7, ruleType: "assistsPoints", position: "all", points: 3, description: "التمريرات الحاسمة", isActive: 1 },
      { id: 8, ruleType: "cleanSheetGoalkeeper", position: "goalkeeper", points: 4, description: "ورقة نظيفة - حارس", isActive: 1 },
      { id: 9, ruleType: "cleanSheetDefender", position: "defender", points: 4, description: "ورقة نظيفة - مدافع", isActive: 1 },
      { id: 10, ruleType: "cleanSheetMidfielder", position: "midfielder", points: 1, description: "ورقة نظيفة - وسط", isActive: 1 },
      { id: 11, ruleType: "savesThreshold", position: "goalkeeper", points: 3, description: "إنقاذ واحد لكل 3 إنقاذات", isActive: 1 },
      { id: 12, ruleType: "yellowCardPenalty", position: "all", points: -1, description: "عقوبة البطاقة الصفراء", isActive: 1 },
      { id: 13, ruleType: "redCardPenalty", position: "all", points: -3, description: "عقوبة البطاقة الحمراء", isActive: 1 },
      { id: 14, ruleType: "goalsAgainstThreshold", position: "all", points: 2, description: "عقوبة لكل هدفين", isActive: 1 },
      { id: 15, ruleType: "goalsAgainstPenalty", position: "all", points: -1, description: "عقوبة الأهداف المستقبلة", isActive: 1 },
      { id: 16, ruleType: "ownGoalPenalty", position: "all", points: -2, description: "عقوبة الهدف الضد", isActive: 1 },
      { id: 17, ruleType: "penaltyMissedPenalty", position: "all", points: -2, description: "عقوبة الركلة الضائعة", isActive: 1 },
      { id: 18, ruleType: "bonusPointsMultiplier", position: "all", points: 1, description: "مضاعف النقاط الإضافية", isActive: 1 },
    ];

    setRules(defaults);
    toast({
      title: "نجح",
      description: "تم إعادة تعيين جميع القواعس إلى القيم الافتراضية",
    });
  };

  // Group rules by category
  const groupedRules = {
    "الدقائق والأساسيات": rules.filter((r) => r.ruleType.includes("minutes") || r.ruleType.includes("Threshold")),
    "الأهداف": rules.filter((r) => r.ruleType.includes("goals")),
    "التمريرات والأوراق النظيفة": rules.filter((r) => r.ruleType.includes("assists") || r.ruleType.includes("cleanSheet")),
    "الإنقاذات": rules.filter((r) => r.ruleType.includes("saves")),
    "العقوبات": rules.filter((r) => r.ruleType.includes("Penalty") || r.ruleType.includes("Card")),
    "الأهداف المستقبلة": rules.filter((r) => r.ruleType.includes("goalsAgainst")),
    "النقاط الإضافية": rules.filter((r) => r.ruleType.includes("bonus")),
  };

  return (
    <div className="space-y-6">
      {/* Warning Alert */}
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          تعديل قواعس النقاط سيؤثر على حساب النقاط للاعبين الجدد فقط. النقاط المحسوبة سابقاً لن تتغير.
        </AlertDescription>
      </Alert>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="text-red-600 hover:text-red-700"
        >
          <RotateCcw className="w-4 h-4 ml-2" />
          إعادة تعيين إلى الافتراضية
        </Button>
      </div>

      {/* Scoring Rules by Category */}
      {Object.entries(groupedRules).map(([category, categoryRules]) => (
        categoryRules.length > 0 && (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{rule.description || rule.ruleType}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.position !== "all" ? `(${rule.position})` : "(الكل)"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingId === rule.id ? (
                        <>
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSave(rule.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold w-16 text-right">
                            {rule.points}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {/* Scoring Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص نظام الترتيق</CardTitle>
          <CardDescription>مثال على حساب النقاط</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">مثال: مهاجم لعب 90 دقيقة وسجل هدف وتمريرة حاسمة</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>90 دقيقة × 1 نقطة</span>
                  <span className="font-bold">90 نقطة</span>
                </div>
                <div className="flex justify-between">
                  <span>1 هدف × 4 نقاط</span>
                  <span className="font-bold">4 نقاط</span>
                </div>
                <div className="flex justify-between">
                  <span>1 تمريرة × 3 نقاط</span>
                  <span className="font-bold">3 نقاط</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>المجموع</span>
                  <span className="text-green-600">97 نقطة</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
