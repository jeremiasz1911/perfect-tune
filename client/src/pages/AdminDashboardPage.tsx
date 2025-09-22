import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import ClassManager from "@/components/admin/admin-pages/LessonManager";
import UserManager from "@/components/admin/admin-pages/UserManager";
import CalendarView from "@/components/admin/CalendarView";
import PaymentManagement from "@/components/admin/PaymentManagement";
import ReportsAnalytics from "@/components/admin/ReportsAnalytics";
import SystemSettings from "@/components/admin/SystemSettings";
import AdminEnrollmentRequests from "@/components/admin/admin-pages/AdminEnrollmentRequests";
import GroupManager from "@/components/admin/admin-pages/GroupManager";

import {
  FaTachometerAlt,
  FaMusic,
  FaCalendarAlt,
  FaUsers,
  FaCreditCard,
  FaChartBar,
  FaCog,
  FaBell,
  FaArrowUp,
  FaDollarSign,
  FaUserPlus,
  FaGraduationCap,
  FaCalendarPlus,
  FaExclamationTriangle,
  FaPeopleCarry,
} from "react-icons/fa";

import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type ActivityItem = {
  id: string;
  type: "request" | "invoice" | "lesson";
  title: string;
  description?: string;
  time?: string;
  iconBg: string;
  icon: JSX.Element;
};

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [totalStudents, setTotalStudents] = useState(0);
  const [activeClasses, setActiveClasses] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  const [classDistribution, setClassDistribution] = useState<
    { name: string; count: number; percentage: number }[]
  >([]);

  const [ageDistribution, setAgeDistribution] = useState<
    { range: string; percentage: number }[]
  >([]);

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();

  const startOfMonth = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // --- CHILDREN ---
        const childrenSnap = await getDocs(collection(db, "children"));
        const children = childrenSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setTotalStudents(children.length);

        // age buckets (jeśli mają pole age)
        const buckets = { "5-7": 0, "8-10": 0, "11-13": 0, "14-17": 0, "18+": 0 };
        let withAge = 0;
        for (const ch of children) {
          const age = Number(ch.age);
          if (Number.isFinite(age)) {
            withAge++;
            if (age <= 7) buckets["5-7"]++;
            else if (age <= 10) buckets["8-10"]++;
            else if (age <= 13) buckets["11-13"]++;
            else if (age <= 17) buckets["14-17"]++;
            else buckets["18+"]++;
          }
        }
        const ageDist = Object.entries(buckets).map(([range, count]) => ({
          range,
          percentage: withAge > 0 ? Math.round((count / withAge) * 100) : 0,
        }));
        setAgeDistribution(ageDist);

        // --- LESSONS ---
        const lessonsSnap = await getDocs(collection(db, "lessons"));
        const lessons = lessonsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setActiveClasses(lessons.length);

        // classDistribution z pola "type"
        const typeCounts: Record<string, number> = {};
        for (const l of lessons) {
          const t = (l.type || "other") as string;
          typeCounts[t] = (typeCounts[t] ?? 0) + 1;
        }
        const totalClasses = lessons.length || 1;
        const dist = Object.entries(typeCounts)
          .map(([name, count]) => ({
            name:
              name === "instrument"
                ? "Lekcje instrumentu"
                : name === "vocal"
                ? "Lekcje wokalne"
                : name === "theory"
                ? "Teoria muzyki"
                : name === "ensemble"
                ? "Zespoły"
                : name,
            count,
            percentage: Math.round((count / totalClasses) * 100),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setClassDistribution(dist);

        // --- INVOICES (paid this month) ---
        // pobierz paid (bez range w zapytaniu, żeby nie wymagać indeksu) i policz na kliencie
        const invoicesSnap = await getDocs(collection(db, "invoices"));
        let revenue = 0;
        const paidInvoices = invoicesSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((i) => i.status === "paid");

        for (const inv of paidInvoices) {
          const paidAt =
            inv.paidAt?.toDate?.() ??
            (inv.paidAt?._seconds ? new Date(inv.paidAt._seconds * 1000) : null);
          if (paidAt && paidAt >= startOfMonth) {
            revenue += Number(inv.amount ?? 0);
          }
        }
        setMonthlyRevenue(revenue);

        // --- ENROLLMENT REQUESTS (pending counter + recent) ---
        const reqSnap = await getDocs(collection(db, "enrollment_requests"));
        const requests = reqSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setPendingRequests(requests.filter((r) => r.status === "pending").length);

        // --- Recent activity: mix  (5 ostatnich lekcji + 5 ostatnich paid + 5 ostatnich wniosków) ---
        // Sortujemy lokalnie po createdAt/paidAt
        const mkDate = (v: any) =>
          v?.toDate?.() ?? (v?._seconds ? new Date(v._seconds * 1000) : null);

        const recentLessons = lessons
          .map((l) => ({
            id: l.id,
            type: "lesson" as const,
            title: l.title || l.name || "Zajęcia dodane",
            time: mkDate(l.createdAt)?.toLocaleString() ?? "",
            iconBg: "bg-blue-100",
            icon: <FaCalendarPlus className="text-blue-600" />,
          }))
          .sort((a, b) => (new Date(b.time).getTime() - new Date(a.time).getTime()))
          .slice(0, 5);

        const recentPaid = paidInvoices
          .map((inv) => ({
            id: inv.id,
            type: "invoice" as const,
            title: `Wpłata: ${Number(inv.amount ?? 0).toFixed(2)} PLN`,
            time: mkDate(inv.paidAt)?.toLocaleString() ?? "",
            iconBg: "bg-green-100",
            icon: <FaDollarSign className="text-green-600" />,
          }))
          .sort((a, b) => (new Date(b.time).getTime() - new Date(a.time).getTime()))
          .slice(0, 5);

        const recentReq = requests
          .map((r) => ({
            id: r.id,
            type: "request" as const,
            title:
              r.status === "pending"
                ? "Nowa prośba o zapis"
                : r.status === "approved"
                ? "Prośba zaakceptowana"
                : "Prośba odrzucona",
            time: mkDate(r.createdAt)?.toLocaleString() ?? "",
            iconBg:
              r.status === "pending"
                ? "bg-primary-light"
                : r.status === "approved"
                ? "bg-green-100"
                : "bg-yellow-100",
            icon:
              r.status === "pending" ? (
                <FaUserPlus className="text-white" />
              ) : r.status === "approved" ? (
                <FaGraduationCap className="text-green-600" />
              ) : (
                <FaExclamationTriangle className="text-yellow-600" />
              ),
          }))
          .sort((a, b) => (new Date(b.time).getTime() - new Date(a.time).getTime()))
          .slice(0, 5);

        const merged: ActivityItem[] = [...recentReq, ...recentPaid, ...recentLessons]
          .sort((a, b) => (new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()))
          .slice(0, 8);

        setRecentActivity(merged);
      } catch (error) {
        console.error("Błąd pobierania danych pulpitu:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować danych pulpitu. Spróbuj ponownie.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast, startOfMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel administracyjny - MusicAcademy</title>
        <meta
          name="description"
          content="Panel administracyjny do zarządzania zajęciami, użytkownikami i systemem MusicAcademy."
        />
      </Helmet>

      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-neutral-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="font-heading font-bold text-xl">MusicAcademy</span>
                <span className="ml-4 text-sm bg-primary px-2 py-1 rounded">Administrator</span>
              </div>

              <div className="flex items-center">
                <div className="mr-4 relative">
                  <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-white">
                    <FaBell className="h-5 w-5" />
                    {pendingRequests > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {Math.min(pendingRequests, 9)}
                      </span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center font-bold">
                    {(user?.displayName?.[0] || "A").toUpperCase()}
                  </div>
                  <span className="ml-2 text-white font-medium hidden md:block">
                    {user?.displayName || "Administrator"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-screen w-full">
            {/* Sidebar */}
            <aside className="w-64 bg-neutral-800 min-h-screen text-white">
              <div className="py-6 px-4">
                <TabsList className="flex flex-col h-auto space-y-1 bg-transparent">
                  <TabsTrigger
                    value="dashboard"
                    className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "dashboard" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <span className="flex items-center">
                      <FaTachometerAlt className="mr-3" />
                      Pulpit
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="calendar"
                    className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "calendar" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-3" />
                      Kalendarz
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="requests"
                    className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "requests" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <span className="flex items-center">
                      <FaUserPlus className="mr-3" />
                      Prośby rodziców
                    </span>
                    {pendingRequests > 0 && (
                      <span className="ml-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {pendingRequests}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="groups"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "groups" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaPeopleCarry className="mr-3" />
                    <span>Grupy</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="lessons"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "lessons" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaMusic className="mr-3" />
                    <span>Zajęcia</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="users"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "users" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaUsers className="mr-3" />
                    <span>Użytkownicy</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="payments"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "payments" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaCreditCard className="mr-3" />
                    <span>Płatności</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="reports"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "reports" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaChartBar className="mr-3" />
                    <span>Raporty</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="settings"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "settings" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaCog className="mr-3" />
                    <span>Ustawienia</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-8">
              <TabsContent value="dashboard" className="mt-0">
                <h1 className="text-2xl font-bold mb-8">Panel administracyjny</h1>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-neutral-600 text-sm">Łączna liczba uczniów</p>
                          <h3 className="text-3xl font-bold mt-1">{totalStudents}</h3>
                          <p className="text-green-600 text-sm mt-2">
                            <FaArrowUp className="inline mr-1" /> miesiąc/miesiąc
                          </p>
                        </div>
                        <div className="bg-primary-light p-3 rounded-lg">
                          <FaGraduationCap className="text-white text-xl" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-neutral-600 text-sm">Aktywne zajęcia</p>
                          <h3 className="text-3xl font-bold mt-1">{activeClasses}</h3>
                          <p className="text-green-600 text-sm mt-2">
                            <FaArrowUp className="inline mr-1" /> miesiąc/miesiąc
                          </p>
                        </div>
                        <div className="bg-secondary p-3 rounded-lg">
                          <FaMusic className="text-white text-xl" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-neutral-600 text-sm">Przychód (ten miesiąc)</p>
                          <h3 className="text-3xl font-bold mt-1">
                            {monthlyRevenue.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
                          </h3>
                          <p className="text-green-600 text-sm mt-2">
                            <FaArrowUp className="inline mr-1" /> miesiąc/miesiąc
                          </p>
                        </div>
                        <div className="bg-accent p-3 rounded-lg">
                          <FaDollarSign className="text-white text-xl" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-neutral-600 text-sm">Oczekujące rejestracje</p>
                          <h3 className="text-3xl font-bold mt-1">{pendingRequests}</h3>
                          <p className="text-yellow-600 text-sm mt-2">Wymaga uwagi</p>
                        </div>
                        <div className="bg-neutral-700 p-3 rounded-lg">
                          <FaUserPlus className="text-white text-xl" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming & activity */}
                <Card className="mb-8">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Nadchodzące zajęcia</CardTitle>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8">‹</Button>
                        <span className="px-3 py-1 text-sm">
                          {new Date().toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
                        </span>
                        <Button size="sm" variant="outline" className="h-8">›</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      (Tu możesz później wpiąć tabelę/harmonogram z realnych lekcji.)
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ostatnia aktywność</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {recentActivity.map((a) => (
                          <div key={a.id} className="flex">
                            <div className="flex-shrink-0 mr-4">
                              <div className={`w-10 h-10 rounded-full ${a.iconBg} flex items-center justify-center`}>
                                {a.icon}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{a.title}</p>
                              {a.description && <p className="text-sm text-neutral-600">{a.description}</p>}
                              {a.time && <p className="text-xs text-neutral-500 mt-1">{a.time}</p>}
                            </div>
                          </div>
                        ))}
                        {recentActivity.length === 0 && (
                          <p className="text-sm text-neutral-500">Brak ostatniej aktywności.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Students overview */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Przegląd zajęć</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {classDistribution.map((item) => (
                          <div key={item.name}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm font-medium">{item.count} zajęć</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        {classDistribution.length === 0 && (
                          <p className="text-sm text-neutral-500">Brak danych o typach zajęć.</p>
                        )}
                      </div>

                      <div className="mt-8 border-t border-neutral-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold">Rozkład wieku</h3>
                        </div>

                        <div className="grid grid-cols-5 gap-2 text-center">
                          {ageDistribution.map((item) => (
                            <div key={item.range}>
                              <div className="h-24 flex items-end">
                                <div
                                  className="w-full bg-primary-light rounded-t"
                                  style={{ height: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <p className="text-xs mt-1">{item.range}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <CalendarView />
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                {/* PODAJEMY adminId = zalogowany użytkownik */}
                <AdminEnrollmentRequests adminId={user?.uid || "admin"} />
              </TabsContent>

              <TabsContent value="groups" className="mt-0">
                <GroupManager />
              </TabsContent>

              <TabsContent value="lessons" className="mt-0">
                <ClassManager />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <UserManager />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <PaymentManagement />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <ReportsAnalytics />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SystemSettings />
              </TabsContent>
            </main>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
