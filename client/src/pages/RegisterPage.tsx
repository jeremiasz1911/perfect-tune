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
import { createUser } from "@/lib/db";
import { FaPlus, FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChildData {
  id: string;
  name: string;
  surname: string;
  age: string;
}

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [children, setChildren] = useState<ChildData[]>([
    { id: "1", name: "", surname: "", age: "" }
  ]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { signupWithEmail } = useAuth();
  const [, navigate] = useLocation();

  const DOT_SVG = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
     <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/>
    </svg>`
  );
  const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

  const addChild = () => {
    setChildren([...children, { id: Date.now().toString(), name: "", surname: "", age: "" }]);
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter(child => child.id !== id));
    }
  };

  const updateChild = (id: string, field: keyof ChildData, value: string) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, [field]: value } : child
    ));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate first step
      if (!firstName || !lastName || !address || !city || !postalCode || !phoneNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate second step
      const invalidChildren = children.some(child => !child.name || !child.surname || !child.age);
      if (invalidChildren) {
        toast({
          title: "Missing Information",
          description: "Please fill in all children details",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate final step
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Brakuje informacji",
        description: "Proszę wypełnić wszystkie wymagane pola",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Hasło nie pasuje",
        description: "Proszę upewnić się, że hasła są takie same",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        title: "Akceptacja warunków jest wymagana",
        description: "Proszę zaakceptować warunki korzystania i politykę prywatności",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await signupWithEmail(email, password);

      if (userCredential?.uid) {
        const parentId = userCredential.uid;
        const childIds: string[] = [];
        // Create children in Firestore
        for (const child of children) {
          // Dodaj dziecko i przekazuj dane oraz parentId
          const newChildRef = await addDoc(collection(db, "children"), {
            name: child.name,
            surname: child.surname,
            age: parseInt(child.age),
            parentId: parentId,
            createdAt: new Date(),
          });
          childIds.push(newChildRef.id);
        }
        // Save user data to Firestore
        await createUser(userCredential.uid, {
          email,
          name: firstName,
          surname: lastName,
          address,
          city,
          postalCode,
          apartmentNumber,
          houseNumber,
          phoneNumber,
          role: "parent",
          children: childIds,
          createdAt: new Date()
        });
        
        toast({
          title: "Konto utworzoneo pomyślnie",
          description: "Witamy w PerfectTune!",
        });
        
        navigate("/dashboard/parent");
      }
    } catch (error: any) {
      toast({
        title: "Rejestracja nie powiodła się",
        description: error.message || "Coś poszło nie tak. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <><div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(1100px 520px at 12% -10%, rgba(88,101,242,.22), transparent 55%),
              radial-gradient(900px 480px at 90% 0%, rgba(186,230,253,.18), transparent 60%),
              radial-gradient(1000px 800px at 50% 115%, rgba(56,189,248,.10), transparent 55%),
              url("${DOT_DATA_URL}")
            `,
            backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
            backgroundSize: "auto, auto, auto, 32px 32px",
          }}
        />
      <Helmet>
        <title>Register - MusicAcademy</title>
        <meta name="description" content="Create a parent account at MusicAcademy to manage your children's music education." />
      </Helmet>
      
      <section className="py-16 bg-black/80 relative z-10">
         
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="rounded-xl shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-primary p-6 text-white">
                  <h2 className="font-accent text-2xl md:text-3xl font-bold">Zakładanie konta PerfectTune</h2>
                  <p className="opacity-90 mt-2">Załóż konto, aby zarządzać edukacją muzyczną swoich dzieci</p>
                  
                  {/* Registration Steps */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-white text-primary' : 'bg-white bg-opacity-80 text-primary'}`}>1</div>
                        <span className="text-xs mt-1">Dane osobowe</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-white text-primary' : currentStep > 2 ? 'bg-white bg-opacity-80 text-primary' : 'bg-white bg-opacity-30 text-primary-dark'}`}>2</div>
                        <span className="text-xs mt-1">Dziecko</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-white text-primary' : 'bg-white bg-opacity-30 text-primary-dark'}`}>3</div>
                        <span className="text-xs mt-1">Konto</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Registration Form */}
                <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                  {/* Step 1: Parent Information */}
                  {currentStep === 1 && (
                    <div id="step-1">
                      <h3 className="font-bold text-lg mb-4">Dane rodzica</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="firstName">Imię</Label>
                          <Input 
                            id="firstName" 
                            type="text" 
                            placeholder="Twoje imię" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nazwisko</Label>
                          <Input 
                            id="lastName" 
                            type="text" 
                            placeholder="Twoje nazwisko" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label htmlFor="phoneNumber">Numer telefonu</Label>
                        <Input 
                          id="phoneNumber" 
                          type="tel" 
                          placeholder="+48 123 456 789" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <Label htmlFor="address">Adres</Label>
                        <Input 
                          id="address" 
                          type="text" 
                          placeholder="Ulica 123" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="city">Miasto</Label>
                          <Input 
                            id="city" 
                            type="text" 
                            placeholder="Miasto" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Kod pocztowy</Label>
                          <Input 
                            id="postalCode" 
                            type="text" 
                            placeholder="06-400" 
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="houseNumber">Numer domu</Label>
                          <Input 
                            id="houseNumber" 
                            type="text" 
                            placeholder="12A/4 lub 2" 
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Children Information */}
                  {currentStep === 2 && (
                    <div id="step-2">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Informacje dziecka</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addChild}
                          className="flex items-center gap-1"
                        >
                          <FaPlus size={12} />
                          Dodaj dziecko
                        </Button>
                      </div>
                      
                      {children.map((child, index) => (
                        <div key={child.id} className="mb-6 p-4 border border-neutral-200 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">Dziecko {index + 1}</h4>
                            {children.length > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeChild(child.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <FaTrash size={14} />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`child-name-${child.id}`}>Imię</Label>
                              <Input 
                                id={`child-name-${child.id}`} 
                                type="text" 
                                placeholder="Imię dziecka" 
                                value={child.name}
                                onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`child-surname-${child.id}`}>Nazwisko</Label>
                              <Input 
                                id={`child-surname-${child.id}`} 
                                type="text" 
                                placeholder="Nazwisko dziecka" 
                                value={child.surname}
                                onChange={(e) => updateChild(child.id, 'surname', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`child-age-${child.id}`}>Wiek</Label>
                              <Input 
                                id={`child-age-${child.id}`} 
                                type="number" 
                                min="1"
                                max="18"
                                placeholder="Wiek" 
                                value={child.age}
                                onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Step 3: Account Information */}
                  {currentStep === 3 && (
                    <div id="step-3">
                      <h3 className="font-bold text-lg mb-4">Informacje o koncie</h3>
                      
                      <div className="mb-4">
                        <Label htmlFor="email">Adres email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Adres email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <Label htmlFor="password">Hasło</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-6">
                        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="acceptTerms" 
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          />
                          <Label htmlFor="acceptTerms" className="text-sm text-neutral-700">
                            Akceptuje <a href="/terms" className="text-primary hover:underline">Warunki korzystania</a> i <a href="/privacy" className="text-primary hover:underline">Polityka prywatności</a>
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    {currentStep > 1 && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handlePrevious}
                        className="flex items-center gap-1"
                      >
                        <FaArrowLeft size={14} />
                        Poprzednia
                      </Button>
                    )}
                    
                    <div className="ml-auto">
                      {currentStep < 3 ? (
                        <Button 
                          type="button" 
                          className="bg-primary hover:bg-primary-dark text-white"
                          onClick={handleNext}
                        >
                          Następna
                          <FaArrowRight size={14} className="ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-primary-dark text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                             Tworzę konto...
                            </div>
                          ) : "Create Account"}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"140\" viewBox=\"0 0 100 100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.35\"/></svg>')",
            backgroundRepeat: "repeat",
          }}
        />
    </>
  );
};

export default RegisterPage;
