// types.ts
import { DocumentReference, Timestamp } from "firebase/firestore";

export type BillingModel = "monthly" | "per_lesson";

export interface Enrollment {
  id?: string;
  parentId: string;
  childId: string;
  lessonId: string;
  status: "active" | "pending" | "canceled";
  billingModel: BillingModel;
  createdAt: any; // Firebase Timestamp
}

export interface Invoice {
  id?: string;
  parentId: string;
  childId: string;
  lessonId: string;
  amount: number;     // trzymaj w PLN lub w groszach – bądź konsekwentny
  currency: "PLN";
  status: "unpaid" | "paid" | "canceled";
  dueDate: any;       // Timestamp
  period?: { from: any; to: any } | null;  // dla monthly
  lessonDate?: any | null;                 // dla per_lesson
  paymentUrl?: string;
  createdAt: any;
  paidAt?: any;
}

export type LessonData = {
  id: string;
  title: string;
  type: "instrument" | "vocal" | "theory" | "ensemble";
  description?: string;
  instructor?: string;
  schedule: {
    date?: Timestamp;
    startDate?: Timestamp;
    endDate?: Timestamp;
    startTime?: string;
    endTime?: string;
    days: string[];
    frequency: "weekly" | "biweekly" | "monthly";
  };
  location?: string;
  participants?: DocumentReference[]; // lub string[] jeżeli tak przechowujesz
  capacity?: number;
  ageRange?: string;
  currency?: "PLN";
  billing: {
    model: "monthly" | "per_lesson";
    priceMonthly?: number;
    pricePerLesson?: number;
    billingDay?: number; // 1-28 (tylko dla monthly)
    dueDays: number;     // np. 7
    proration?: boolean; // tylko dla monthly
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// types/user.ts

export interface Child {
  id?: string;          // opcjonalne, jeśli chcecie przechowywać doc.id
  name: string;
  surname: string;
  age: number;
}

export type UserRole = "parent" | "admin" | "other";  // dopasuj do Waszych ról

export interface User {
  id?: string;                  // Firestore document ID
  name: string;                 
  surname: string;              
  email: string;                
  phoneNumber: string;          
  role: UserRole;               
  status?: string;              // np. "active" | "pending" itp.
  
  // adres
  address: string;              // np. "Południowa 21B, 1"
  houseNumber: string;          // np. "1"
  apartmentNumber: string;      // np. "1"
  city: string;                 
  postalCode: string;          

  // meta
  createdAt: Timestamp;         
  lastLogin: Timestamp;         

  // powiązane dzieci
  children: Child[];            
}
