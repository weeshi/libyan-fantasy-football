import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle, Trophy, Users, Zap, Target, TrendingUp, Shield } from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

const faqItems: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'البداية',
    question: 'كيف أبدأ اللعب؟',
    answer: 'لبدء اللعب، قم بـ: 1) إنشاء حساب جديد 2) إنشاء فريقك الخاص 3) اختيار 11 لاعباً من الدوري الليبي 4) ابدأ المنافسة مع لاعبين آخرين. لديك ميزانية محدودة (10 مليون دينار) لاختيار لاعبيك.',
    icon: <Trophy className="w-5 h-5" />
  },
  {
    id: 'gs-2',
    category: 'البداية',
    question: 'ما هي الميزانية الأولية؟',
    answer: 'الميزانية الأولية هي 10 مليون دينار ليبي. يجب عليك اختيار 11 لاعباً (1 حارس مرمى، 4 مدافعين، 4 لاعبي وسط، 2 مهاجمين) ضمن هذه الميزانية. يمكنك نقل اللاعبين لاحقاً خلال فترات الانتقالات.',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'gs-3',
    category: 'البداية',
    question: 'هل يمكن تغيير فريقي بعد إنشاؤه؟',
    answer: 'نعم! يمكنك تغيير فريقك في أي وقت خلال فترات الانتقالات المتاحة. كل أسبوع تحصل على عدد محدود من التبديلات المجانية. بعد استنفاد التبديلات المجانية، يمكنك شراء تبديلات إضافية.',
    icon: <Users className="w-5 h-5" />
  },

  // Scoring System
  {
    id: 'score-1',
    category: 'نظام النقاط',
    question: 'كيف يتم حساب النقاط؟',
    answer: 'النقاط تُحسب بناءً على أداء اللاعب الفعلي في المباريات:\n• حارس المرمى: نظيفة (5 نقاط)، هدف مستقبل (-1 نقطة)\n• المدافع: نظيفة (5 نقاط)، هدف (-1 نقطة)\n• لاعب الوسط: نظيفة (5 نقاط)، هدف (5 نقاط)، تمرير حاسمة (1 نقطة)\n• المهاجم: هدف (4 نقاط)، تمرير حاسمة (1 نقطة)\n• الأوراق الصفراء: -1 نقطة، الحمراء: -3 نقاط',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 'score-2',
    category: 'نظام النقاط',
    question: 'متى يتم تحديث النقاط؟',
    answer: 'يتم تحديث النقاط بعد انتهاء كل مباراة مباشرة. يمكنك متابعة نقاط فريقك في الوقت الفعلي من لوحة التحكم. النقاط النهائية تُؤكد بعد 24 ساعة من انتهاء المباراة.',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'score-3',
    category: 'نظام النقاط',
    question: 'هل يمكن أن تكون النقاط سالبة؟',
    answer: 'نعم، النقاط يمكن أن تكون سالبة إذا كان أداء لاعبيك سيئة جداً. لكن في نهاية الموسم، الفرق التي لديها نقاط سالبة ستحصل على نقطة واحدة على الأقل.',
    icon: <Shield className="w-5 h-5" />
  },

  // Team Management
  {
    id: 'team-1',
    category: 'إدارة الفريق',
    question: 'كم عدد لاعبي الاحتياط المسموح به؟',
    answer: 'يمكنك اختيار 15 لاعباً إجمالاً: 11 في الملعب و4 احتياطيين. يمكنك تبديل اللاعبين بين الملعب والاحتياط في أي وقت قبل بدء المباراة.',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'team-2',
    category: 'إدارة الفريق',
    question: 'ما هي الرتب والمراكز المطلوبة؟',
    answer: 'يجب أن يكون فريقك مكوناً من:\n• 1 حارس مرمى (GK)\n• 4 مدافعين (DEF)\n• 4 لاعبي وسط (MID)\n• 2 مهاجمين (FWD)\n\nيمكنك اختيار تشكيلة مختلفة من الاحتياطيين.',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'team-3',
    category: 'إدارة الفريق',
    question: 'هل يمكن اختيار لاعب واحد من نفس الفريق؟',
    answer: 'نعم، يمكنك اختيار عدة لاعبين من نفس الفريق الحقيقي. لكن هناك حد أقصى (عادة 3 لاعبين) من نفس الفريق في تشكيلتك الأساسية.',
    icon: <Users className="w-5 h-5" />
  },

  // Transfers
  {
    id: 'trans-1',
    category: 'الانتقالات',
    question: 'متى يمكنني نقل اللاعبين؟',
    answer: 'فترات الانتقالات تكون:\n• قبل بدء الموسم (فترة تحضيرية)\n• بين الجولات الأسبوعية (عادة يوم الثلاثاء)\n• فترات الانتقالات الرسمية (يناير وأغسطس)\n\nيمكنك متابعة فترات الانتقالات من التقويم في التطبيق.',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'trans-2',
    category: 'الانتقالات',
    question: 'كم عدد التبديلات المجانية؟',
    answer: 'تحصل على عدد محدود من التبديلات المجانية كل أسبوع (عادة 1-2 تبديل). بعد استنفاذ التبديلات المجانية، كل تبديل إضافي يكلفك 4 نقاط. النقاط المخصومة تُطرح من إجمالي نقاطك للأسبوع.',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'trans-3',
    category: 'الانتقالات',
    question: 'هل يمكن استرجاع لاعب بعد نقله؟',
    answer: 'نعم، يمكنك استرجاع لاعب بعد نقله، لكن سيُعتبر كتبديل جديد ويكلفك نقاط إضافية إذا تجاوزت التبديلات المجانية.',
    icon: <Zap className="w-5 h-5" />
  },

  // Chips & Boosts
  {
    id: 'chip-1',
    category: 'الرقائق والمعززات',
    question: 'ما هي الرقائق (Chips)؟',
    answer: 'الرقائق هي معززات خاصة تستخدمها مرة واحدة فقط في الموسم لتحسين أدائك:\n• Wildcard: غير تشكيلتك بالكامل بدون تكلفة\n• Bench Boost: احصل على نقاط لاعبيك الاحتياطيين أيضاً\n• Triple Captain: احصل على 3 أضعاف نقاط قائد فريقك\n• Free Hit: غير تشكيلتك مؤقتاً لأسبوع واحد فقط',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'chip-2',
    category: 'الرقائق والمعززات',
    question: 'متى يجب أن أستخدم الرقائق؟',
    answer: 'استخدم الرقائق في الأوقات الحرجة:\n• Wildcard: عندما تريد تغيير فريقك بالكامل\n• Triple Captain: اختر أسبوعاً يلعب فيه قائدك ضد فريق ضعيف\n• Bench Boost: استخدمه في أسبوع يلعب فيه احتياطيوك أيضاً\n• Free Hit: استخدمه قبل فترة انتقالات مهمة',
    icon: <Zap className="w-5 h-5" />
  },

  // Captaincy
  {
    id: 'cap-1',
    category: 'القيادة',
    question: 'من هو القائد؟',
    answer: 'القائد هو اللاعب الذي تختاره ليحصل على نقاط مضاعفة (2x) في الأسبوع. يمكنك تغيير القائد قبل بدء المباراة مباشرة. اختر دائماً لاعباً سيلعب في الأسبوع.',
    icon: <Trophy className="w-5 h-5" />
  },
  {
    id: 'cap-2',
    category: 'القيادة',
    question: 'متى يتم تحديث القائد؟',
    answer: 'يمكنك تحديث القائد قبل بدء أول مباراة في الأسبوع مباشرة. بعد بدء المباراة، لا يمكنك تغيير القائد. تأكد من اختيار قائد سيلعب في الأسبوع.',
    icon: <Trophy className="w-5 h-5" />
  },

  // Leagues & Competitions
  {
    id: 'league-1',
    category: 'الدوريات',
    question: 'ما هي الدوريات المتاحة؟',
    answer: 'هناك عدة أنواع من الدوريات:\n• الدوري الكلاسيكي: منافسة عامة مع جميع اللاعبين\n• دوري الأصدقاء: منافسة خاصة مع أصدقائك\n• دوري الرأس برأس (H2H): منافسة مباشرة بين فريقين\n• كأس الخيال: بطولة إقصائية',
    icon: <Trophy className="w-5 h-5" />
  },
  {
    id: 'league-2',
    category: 'الدوريات',
    question: 'كيف أنضم إلى دوري الأصدقاء؟',
    answer: 'لإنشاء أو الانضمام إلى دوري أصدقاء:\n1) اذهب إلى قسم الدوريات\n2) اختر "إنشاء دوري جديد" أو "الانضمام إلى دوري موجود"\n3) شارك رمز الدوري مع أصدقائك\n4) يمكن لأصدقائك الانضمام باستخدام الرمز',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'league-3',
    category: 'الدوريات',
    question: 'ما هو الفرق بين الدوري الكلاسيكي والرأس برأس؟',
    answer: 'الدوري الكلاسيكي: تنافس مع جميع اللاعبين، والترتيب يعتمد على إجمالي النقاط.\nالرأس برأس (H2H): تنافس مباشر بين فريقين، كل أسبوع يوجد مباراة بينك وبين خصم، والفائز هو من يحصل على نقاط أكثر.',
    icon: <Trophy className="w-5 h-5" />
  },

  // Statistics & Rankings
  {
    id: 'stat-1',
    category: 'الإحصائيات',
    question: 'كيف أرى إحصائيات لاعبي؟',
    answer: 'يمكنك رؤية إحصائيات لاعبيك من:\n• لوحة التحكم: ملخص سريع\n• صفحة الفريق: تفاصيل كاملة\n• صفحة اللاعب: إحصائيات مفصلة\n• صفحة المقارنة: مقارنة بين عدة لاعبين',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'stat-2',
    category: 'الإحصائيات',
    question: 'كيف أرى ترتيب الدوري؟',
    answer: 'اذهب إلى قسم الدوريات واختر الدوري الذي تريد. ستجد جدول الترتيب يعرض:\n• ترتيب الفرق\n• عدد النقاط\n• الفرق عن الفريق الأول\n• عدد المباريات المتبقية',
    icon: <Trophy className="w-5 h-5" />
  },

  // Troubleshooting
  {
    id: 'trouble-1',
    category: 'استكشاف الأخطاء',
    question: 'لماذا لم تُحدّث نقاطي؟',
    answer: 'إذا لم تُحدّث نقاطك:\n1) تأكد من أن مباراة لاعبيك انتهت\n2) انتظر 5-10 دقائق للتحديث\n3) حاول تحديث الصفحة\n4) تأكد من أن لاعبيك كانوا في التشكيلة الأساسية\n5) إذا استمرت المشكلة، تواصل مع الدعم',
    icon: <HelpCircle className="w-5 h-5" />
  },
  {
    id: 'trouble-2',
    category: 'استكشاف الأخطاء',
    question: 'لماذا لا أستطيع تغيير فريقي؟',
    answer: 'قد لا تتمكن من تغيير فريقك إذا:\n1) لم تكن في فترة انتقالات\n2) استنفدت جميع التبديلات المجانية\n3) لم تملك ميزانية كافية\n4) المباريات بدأت بالفعل\n\nتحقق من التقويم لمعرفة فترات الانتقالات المتاحة.',
    icon: <HelpCircle className="w-5 h-5" />
  },
  {
    id: 'trouble-3',
    category: 'استكشاف الأخطاء',
    question: 'كيف أتواصل مع الدعم؟',
    answer: 'للتواصل مع فريق الدعم:\n1) اذهب إلى قسم "الإعدادات"\n2) اختر "الدعم"\n3) أرسل رسالتك مع تفاصيل المشكلة\n4) سيرد عليك الفريق في أسرع وقت\n\nيمكنك أيضاً التواصل عبر البريد الإلكتروني أو وسائل التواصل الاجتماعي.',
    icon: <HelpCircle className="w-5 h-5" />
  },
];

const categories = Array.from(new Set(faqItems.map(item => item.category)));

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = selectedCategory
    ? faqItems.filter(item => item.category === selectedCategory)
    : faqItems;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">الأسئلة الشائعة</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            إجابات شاملة عن كيفية اللعب والقواعد الأساسية
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              الكل ({faqItems.length})
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category} ({faqItems.filter(item => item.category === category).length})
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {item.icon && (
                      <div className="text-primary mt-1 flex-shrink-0">
                        {item.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.question}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {item.category}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-muted-foreground">
                    {expandedId === item.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedId === item.id && (
                <CardContent className="pt-0 border-t">
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {item.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لم نجد أسئلة في هذه الفئة</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                هل لديك سؤال لم يتم الإجابة عليه؟
              </p>
              <Button variant="outline">
                تواصل معنا
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
