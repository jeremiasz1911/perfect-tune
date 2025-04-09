import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FaGoogle } from "react-icons/fa";
import { Link } from "wouter";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, loginWithGoogle, checkIsAdmin } = useAuth();
  const [, navigate] = useLocation();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });
        
        // Check if admin and redirect accordingly
        const isAdmin = await checkUserRole(user.uid);
        navigate(isAdmin ? "/dashboard/admin" : "/dashboard/parent");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        toast({
          title: "Success",
          description: "You have successfully logged in with Google",
        });
        
        // Check if admin and redirect accordingly
        const isAdmin = await checkUserRole(user.uid);
        navigate(isAdmin ? "/dashboard/admin" : "/dashboard/parent");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not log in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if user is admin, uses the checkIsAdmin function from auth context
  const checkUserRole = async (uid: string): Promise<boolean> => {
    return await checkIsAdmin(uid);
  };

  return (
    <>
      <Helmet>
        <title>Login - MusicAcademy</title>
        <meta name="description" content="Log in to your MusicAcademy account to manage your classes and workshops." />
      </Helmet>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 bg-primary p-8 text-white">
                  <h2 className="font-accent text-3xl font-bold mb-6">Welcome Back</h2>
                  <p className="mb-8 opacity-90">
                    Log in to access your dashboard, manage your classes, and track your progress.
                  </p>
                  
                  <form className="space-y-4" onSubmit={handleEmailLogin}>
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 rounded bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2 rounded bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                        />
                        <Label htmlFor="remember" className="ml-2 text-sm text-white">Remember me</Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-white hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-white text-primary hover:bg-neutral-100 font-medium py-2 px-4 rounded transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging in...
                        </div>
                      ) : "Log In"}
                    </Button>

                    <div className="relative flex items-center justify-center mt-6">
                      <div className="border-t border-white border-opacity-30 w-full"></div>
                      <span className="bg-primary px-2 text-white text-sm">Or</span>
                      <div className="border-t border-white border-opacity-30 w-full"></div>
                    </div>

                    <Button 
                      type="button" 
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-white text-neutral-800 hover:bg-neutral-100 font-medium py-2 px-4 rounded transition-all duration-200"
                    >
                      <FaGoogle className="mr-2" />
                      Sign in with Google
                    </Button>
                  </form>
                </div>
                
                <div className="w-full md:w-1/2 p-8">
                  <h2 className="font-accent text-3xl font-bold text-neutral-800 mb-6">Create an Account</h2>
                  <p className="text-neutral-600 mb-6">
                    Register to enroll in classes, manage your children's musical education, and stay updated on new offerings.
                  </p>
                  
                  <Link href="/register">
                    <Button className="block w-full bg-primary hover:bg-primary-dark text-white text-center font-medium py-3 px-4 rounded transition-all duration-200 mb-6">
                      Register Now
                    </Button>
                  </Link>
                  
                  <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-100">
                    <h3 className="font-bold text-lg mb-4">As a registered parent, you can:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="text-primary flex-shrink-0 h-5 w-5 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-700 ml-3">Manage multiple children's class schedules</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="text-primary flex-shrink-0 h-5 w-5 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-700 ml-3">Track attendance and progress</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="text-primary flex-shrink-0 h-5 w-5 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-700 ml-3">Make secure online payments</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="text-primary flex-shrink-0 h-5 w-5 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-700 ml-3">Communicate directly with instructors</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="text-primary flex-shrink-0 h-5 w-5 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-700 ml-3">Reserve spots in upcoming workshops</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
