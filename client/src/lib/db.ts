import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  DocumentData,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot
} from "firebase/firestore";
import { db } from "./firebase";

// Collection references
export const usersCollection = collection(db, "users");
export const childrenCollection = collection(db, "children");
export const classesCollection = collection(db, "classes");
export const enrollmentsCollection = collection(db, "enrollments");
export const paymentsCollection = collection(db, "payments");
export const attendanceCollection = collection(db, "attendance");
export const workshopsCollection = collection(db, "workshops");
export const notificationsCollection = collection(db, "notifications");

// User related functions
export const createUser = async (uid: string, userData: any) => {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, {
    ...userData,
    createdAt: Timestamp.now()
  });
  return userDocRef;
};

export const getUserByUid = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

// Children related functions
export const addChild = async (parentId: string, childData: any) => {
  const docRef = await addDoc(childrenCollection, {
    parentId,
    ...childData,
    createdAt: Timestamp.now()
  });
  return docRef;
};

export const getChildrenByParentId = async (parentId: string) => {
  const q = query(childrenCollection, where("parentId", "==", parentId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Class related functions
export const createClass = async (classData: any) => {
  const docRef = await addDoc(classesCollection, {
    ...classData,
    createdAt: Timestamp.now()
  });
  return docRef;
};

export const getClasses = async (classType?: string) => {
  let q;
  if (classType) {
    q = query(classesCollection, where("type", "==", classType));
  } else {
    q = classesCollection;
  }
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getClassById = async (classId: string) => {
  const classDocRef = doc(db, "classes", classId);
  const classDoc = await getDoc(classDocRef);
  return classDoc.exists() ? { id: classDoc.id, ...classDoc.data() } : null;
};

// Enrollment related functions
export const createEnrollment = async (enrollmentData: any) => {
  const docRef = await addDoc(enrollmentsCollection, {
    ...enrollmentData,
    enrollmentDate: Timestamp.now()
  });
  return docRef;
};

export const getEnrollmentsByChildId = async (childId: string) => {
  const q = query(enrollmentsCollection, where("childId", "==", childId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Payment related functions
export const createPayment = async (paymentData: any) => {
  const docRef = await addDoc(paymentsCollection, {
    ...paymentData,
    paymentDate: Timestamp.now()
  });
  return docRef;
};

export const getPaymentsByUserId = async (userId: string) => {
  const q = query(paymentsCollection, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Attendance related functions
export const createAttendance = async (attendanceData: any) => {
  const docRef = await addDoc(attendanceCollection, attendanceData);
  return docRef;
};

export const getAttendanceByEnrollmentId = async (enrollmentId: string) => {
  const q = query(attendanceCollection, where("enrollmentId", "==", enrollmentId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Workshops related functions
export const getWorkshops = async () => {
  const querySnapshot = await getDocs(workshopsCollection);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getWorkshopById = async (workshopId: string) => {
  const workshopDocRef = doc(db, "workshops", workshopId);
  const workshopDoc = await getDoc(workshopDocRef);
  return workshopDoc.exists() ? { id: workshopDoc.id, ...workshopDoc.data() } : null;
};

export const createWorkshop = async (workshopData: any) => {
  const docRef = await addDoc(workshopsCollection, {
    ...workshopData,
    createdAt: Timestamp.now()
  });
  return docRef;
};

export const updateWorkshop = async (workshopId: string, workshopData: any) => {
  const workshopDocRef = doc(db, "workshops", workshopId);
  await updateDoc(workshopDocRef, workshopData);
  return workshopDocRef;
};

// Notification related functions
export const createNotification = async (notificationData: any) => {
  const docRef = await addDoc(notificationsCollection, {
    ...notificationData,
    createdAt: Timestamp.now(),
    read: false
  });
  return docRef;
};

export const getUserNotifications = async (userId: string) => {
  const q = query(
    notificationsCollection, 
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
  return notificationRef;
};

// TPay payment processing functions
export interface TPay {
  createPayment: (amount: number, description: string, email: string, returnUrl: string) => Promise<any>;
  verifyPayment: (paymentId: string) => Promise<any>;
}

// This is a mock implementation - in production you would integrate with the actual TPay API
export const tpay: TPay = {
  createPayment: async (amount: number, description: string, email: string, returnUrl: string) => {
    // In a real implementation, you would call the TPay API here
    // and return the payment ID and URL
    console.log("Creating TPay payment:", { amount, description, email, returnUrl });
    
    // Create a payment record in our database
    const paymentData = {
      amount,
      description,
      email,
      status: "pending",
      currency: "PLN",
      paymentMethod: "Tpay",
      createdAt: Timestamp.now()
    };
    
    const paymentRef = await addDoc(paymentsCollection, paymentData);
    
    // In a real implementation, you would return the TPay payment URL and ID
    return {
      paymentId: paymentRef.id,
      paymentUrl: `https://secure.tpay.com?payment=${paymentRef.id}`,
      success: true
    };
  },
  
  verifyPayment: async (paymentId: string) => {
    // In a real implementation, you would verify the payment status with TPay
    const paymentRef = doc(db, "payments", paymentId);
    const payment = await getDoc(paymentRef);
    
    if (!payment.exists()) {
      return { success: false, error: "Payment not found" };
    }
    
    // Simulate a successful payment
    await updateDoc(paymentRef, { status: "completed" });
    
    return { success: true, status: "completed" };
  }
};
