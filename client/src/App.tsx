import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import WorkshopsPage from "@/pages/WorkshopsPage";
import GalleryPage from "@/pages/GalleryPage";
import ClassesPage from "@/pages/ClassesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ContactPage from "@/pages/ContactPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ParentDashboardPage from "@/pages/ParentDashboardPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/utils/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import { AnimatePresence } from "framer-motion";

function App() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Switch key={location}>
            <Route path="/" component={HomePage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/workshops" component={WorkshopsPage} />
            <Route path="/gallery" component={GalleryPage} />
            <Route path="/classes" component={ClassesPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/parent">
              {() => (
                <ProtectedRoute role="parent">
                  <ParentDashboardPage />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/admin">
              {() => (
                <ProtectedRoute role="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              )}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
