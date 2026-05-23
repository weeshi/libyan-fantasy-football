/**
 * Admin Dashboard Component
 * Main page for admin management of gameweeks, matches, and results
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Edit2, Trash2, Check, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">إدارة الأسابيع والمباريات والنتائج والنقاط</p>
        </div>

        {/* Admin Alert */}
        <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            أنت تستخدم لوحة تحكم الإدارة. تأكد من دقة جميع البيانات المدخلة قبل الحفظ.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="text-base">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="gameweeks" className="text-base">
              الأسابيع
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-base">
              المباريات
            </TabsTrigger>
            <TabsTrigger value="results" className="text-base">
              النتائج
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-base">
              النقاط
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </TabsContent>

          {/* Gameweek Management Tab */}
          <TabsContent value="gameweeks">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الأسابيع</CardTitle>
                <CardDescription>
                  إنشاء وتحديث الأسابيع والمواعيد النهائية للانتقالات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">جاري تطوير هذه الميزة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Match Management Tab */}
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المباريات</CardTitle>
                <CardDescription>
                  إضافة وتحديث المباريات والمواعيد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">جاري تطوير هذه الميزة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Result Management Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>إدارة النتائج</CardTitle>
                <CardDescription>
                  تحديث نتائج المباريات وأداء اللاعبين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">جاري تطوير هذه الميزة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Rules Tab */}
          <TabsContent value="scoring">
            <Card>
              <CardHeader>
                <CardTitle>قواعس النقاط</CardTitle>
                <CardDescription>
                  إدارة وتخصيص قواعس حساب النقاط
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">جاري تطوير هذه الميزة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
