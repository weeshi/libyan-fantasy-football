/**
 * Admin Dashboard Component
 * Main page for admin management of gameweeks, matches, and results
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Edit2, Trash2, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GameweekManagement from "@/components/admin/GameweekManagement";
import MatchManagement from "@/components/admin/MatchManagement";
import ResultManagement from "@/components/admin/ResultManagement";
import ScoringRulesManagement from "@/components/admin/ScoringRulesManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("gameweeks");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">إدارة الأسابيع والمباريات والنتائج</p>
        </div>

        {/* Admin Alert */}
        <Alert className="mb-6 border-blue-500 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            أنت تستخدم لوحة تحكم الإدارة. تأكد من دقة جميع البيانات المدخلة قبل الحفظ.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="gameweeks" className="text-base">
              إدارة الأسابيع
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-base">
              إدارة المباريات
            </TabsTrigger>
            <TabsTrigger value="results" className="text-base">
              إدارة النتائج
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-base">
              قواعس النقاط
            </TabsTrigger>
          </TabsList>

          {/* Gameweek Management Tab */}
          <TabsContent value="gameweeks">
            <GameweekManagement />
          </TabsContent>

          {/* Match Management Tab */}
          <TabsContent value="matches">
            <MatchManagement />
          </TabsContent>

          {/* Result Management Tab */}
          <TabsContent value="results">
            <ResultManagement />
          </TabsContent>

          {/* Scoring Rules Tab */}
          <TabsContent value="scoring">
            <ScoringRulesManagement />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الأسابيع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-xs text-muted-foreground mt-1">في الموسم الحالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المباريات المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">من إجمالي المباريات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المباريات الجارية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">الآن</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المباريات المتبقية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">هذا الأسبوع</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
