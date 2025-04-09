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
