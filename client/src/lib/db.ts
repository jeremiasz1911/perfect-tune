import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  documentId,
  arrayUnion,
  arrayRemove,
  writeBatch,
  serverTimestamp,
  runTransaction,
  
} from "firebase/firestore";

import { db } from "./firebase";
import { Invoice, BillingModel } from "./types";

// ---- Collections
export const usersCollection = collection(db, "users");
export const childrenCollection = collection(db, "children");
export const classesCollection = collection(db, "classes");
export const lessonsCollection = collection(db, "lessons");
export const enrollmentsCollection = collection(db, "enrollments");
export const paymentsCollection = collection(db, "payments");
export const attendanceCollection = collection(db, "attendance");
export const workshopsCollection = collection(db, "workshops");
export const notificationsCollection = collection(db, "notifications");
export const invoicesCollection = collection(db, "invoices");

// ---- Helpers
const num = (v: any, d = 0) => (typeof v === "number" ? v : Number(v ?? d));
const bool = (v: any, d = false) => (typeof v === "boolean" ? v : Boolean(v ?? d));

/**
 * Normalizuje obiekt zajęć niezależnie od tego, czy pochodzi z `lessons` czy `classes`.
 * Zapewnia spójne billing: { model, priceMonthly?, pricePerLesson?, billingDay?, dueDays?, proration? }
 */
export const getOfferingById = async (id: string) => {
  // 1) lessons
  const lSnap = await getDoc(doc(db, "lessons", id));
  if (lSnap.exists()) {
    const data: any = lSnap.data();

    const inferModel: BillingModel =
      (data?.billing?.model as BillingModel) ||
      (data?.billing?.pricePerLesson != null || data?.price != null
        ? "per_lesson"
        : "monthly");

    const normalized = {
      id: lSnap.id,
      title: data?.title || data?.name || "Zajęcia",
      location: data?.location || "",
      schedule: data?.schedule || null,
      currency: data?.currency || "PLN",
      billing: {
        model: inferModel,
        priceMonthly:
          inferModel === "monthly"
            ? num(data?.billing?.priceMonthly ?? data?.priceMonthly)
            : undefined,
        pricePerLesson:
          inferModel === "per_lesson"
            ? num(data?.billing?.pricePerLesson ?? data?.pricePerLesson ?? data?.price)
            : undefined,
        billingDay:
          inferModel === "monthly" ? num(data?.billing?.billingDay ?? 1, 1) : undefined,
        dueDays: num(data?.billing?.dueDays ?? 7, 7),
        proration: inferModel === "monthly" ? bool(data?.billing?.proration, true) : undefined,
      },
    };
    return normalized;
  }

  // 2) classes (backward-compat)
  const cSnap = await getDoc(doc(db, "classes", id));
  if (cSnap.exists()) {
    const data: any = cSnap.data();

    const inferModel: BillingModel =
      (data?.billing?.model as BillingModel) ||
      (data?.billing?.pricePerLesson != null || data?.price != null
        ? "per_lesson"
        : "monthly");

    const normalized = {
      id: cSnap.id,
      title: data?.title || data?.name || "Zajęcia",
      location: data?.location || "",
      schedule: data?.schedule || null,
      currency: data?.currency || "PLN",
      billing: {
        model: inferModel,
        priceMonthly:
          inferModel === "monthly"
            ? num(data?.billing?.priceMonthly ?? data?.priceMonthly)
            : undefined,
        pricePerLesson:
          inferModel === "per_lesson"
            ? num(data?.billing?.pricePerLesson ?? data?.pricePerLesson ?? data?.price)
            : undefined,
        billingDay:
          inferModel === "monthly" ? num(data?.billing?.billingDay ?? 1, 1) : undefined,
        dueDays: num(data?.billing?.dueDays ?? 7, 7),
        proration: inferModel === "monthly" ? bool(data?.billing?.proration, true) : undefined,
      },
    };
    return normalized;
  }

  return null;
};

// ---- Lessons
export const createLesson = async (lessonData: any) => {
  const ref = await addDoc(lessonsCollection, { ...lessonData, createdAt: Timestamp.now() });
  return ref;
};

export const getLessons = async () => {
  const snap = await getDocs(lessonsCollection);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getLessonById = async (lessonId: string) => {
  const s = await getDoc(doc(db, "lessons", lessonId));
  return s.exists() ? { id: s.id, ...s.data() } : null;
};

// ---- Users
export const createUser = async (uid: string, userData: any) => {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, { ...userData, createdAt: Timestamp.now() });
  return userDocRef;
};

export const getUserByUid = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

// ---- Children
export const addChild = async (parentId: string, childData: any) => {
  const docRef = await addDoc(childrenCollection, { parentId, ...childData, createdAt: Timestamp.now() });
  return docRef;
};

export const getChildrenByParentId = async (parentId: string) => {
  const q = query(childrenCollection, where("parentId", "==", parentId));
  const qs = await getDocs(q);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ---- Classes (legacy)
export const createClass = async (classData: any) => {
  const docRef = await addDoc(classesCollection, { ...classData, createdAt: Timestamp.now() });
  return docRef;
};

export const getClasses = async (classType?: string) => {
  const qRef = classType ? query(classesCollection, where("type", "==", classType)) : classesCollection;
  const qs = await getDocs(qRef);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Zachowujemy dla kompatybilności, ale najnowszy kod powinien używać getOfferingById
export const getClassById = async (classId: string) => {
  // najpierw classes
  const classDocRef = doc(db, "classes", classId);
  const classDoc = await getDoc(classDocRef);
  if (classDoc.exists()) return { id: classDoc.id, ...classDoc.data() };

  // fallback lessons
  const lessonDocRef = doc(db, "lessons", classId);
  const lessonDoc = await getDoc(lessonDocRef);
  return lessonDoc.exists() ? { id: lessonDoc.id, ...lessonDoc.data() } : null;
};

// ---- Enrollments
export const createEnrollment = async (enrollmentData: any) => {
  const docRef = await addDoc(enrollmentsCollection, { ...enrollmentData, enrollmentDate: Timestamp.now() });
  return docRef;
};

export const getEnrollmentsByChildId = async (childId: string) => {
  const q = query(enrollmentsCollection, where("childId", "==", childId));
  const qs = await getDocs(q);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ---- Payments (mock TPay)
export const createPayment = async (paymentData: any) => {
  const docRef = await addDoc(paymentsCollection, { ...paymentData, paymentDate: Timestamp.now() });
  return docRef;
};

export const getPaymentsByUserId = async (userId: string) => {
  const q = query(paymentsCollection, where("userId", "==", userId));
  const qs = await getDocs(q);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ---- Attendance
export const createAttendance = async (attendanceData: any) => {
  const docRef = await addDoc(attendanceCollection, attendanceData);
  return docRef;
};

export const getAttendanceByEnrollmentId = async (enrollmentId: string) => {
  const q = query(attendanceCollection, where("enrollmentId", "==", enrollmentId));
  const qs = await getDocs(q);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ---- Workshops
export const getWorkshops = async () => {
  const qs = await getDocs(workshopsCollection);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getWorkshopById = async (workshopId: string) => {
  const ref = doc(db, "workshops", workshopId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createWorkshop = async (workshopData: any) => {
  const docRef = await addDoc(workshopsCollection, { ...workshopData, createdAt: Timestamp.now() });
  return docRef;
};

export const updateWorkshop = async (workshopId: string, workshopData: any) => {
  const ref = doc(db, "workshops", workshopId);
  await updateDoc(ref, workshopData);
  return ref;
};

// ---- Notifications
export const createNotification = async (notificationData: any) => {
  const docRef = await addDoc(notificationsCollection, {
    ...notificationData,
    createdAt: Timestamp.now(),
    read: false,
  });
  return docRef;
};

export const getUserNotifications = async (userId: string) => {
  const q = query(notificationsCollection, where("userId", "==", userId));
  const qs = await getDocs(q);
  // sortujemy po createdAt malejąco po stronie klienta (brak wymaganego indeksu)
  const items = qs.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  items.sort((a, b) => {
    const ta = (a.createdAt?.toDate?.() ?? new Date(0)).getTime();
    const tb = (b.createdAt?.toDate?.() ?? new Date(0)).getTime();
    return tb - ta;
  });
  return items.slice(0, 20);
};

export const markNotificationAsRead = async (notificationId: string) => {
  const ref = doc(db, "notifications", notificationId);
  await updateDoc(ref, { read: true });
  return ref;
};

// ---- TPay mock
export interface TPay {
  createPayment: (
    amount: number,
    description: string,
    email: string,
    returnUrl: string
  ) => Promise<any>;
  verifyPayment: (paymentId: string) => Promise<any>;
}

export const tpay: TPay = {
  async createPayment(amount, description, email, returnUrl) {
    const paymentData = {
      amount,
      description,
      email,
      status: "pending",
      currency: "PLN",
      paymentMethod: "Tpay",
      returnUrl,
      createdAt: Timestamp.now(),
    };
    const paymentRef = await addDoc(paymentsCollection, paymentData);
    return {
      paymentId: paymentRef.id,
      paymentUrl: `https://secure.tpay.com?payment=${paymentRef.id}`,
      success: true,
    };
  },
  async verifyPayment(paymentId: string) {
    const ref = doc(db, "payments", paymentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: "Payment not found" };
    await updateDoc(ref, { status: "completed" });
    return { success: true, status: "completed" };
  },
};

// ---- Invoices
export const createInvoice = async (data: Omit<Invoice, "id" | "createdAt">) => {
  const ref = await addDoc(invoicesCollection, { ...data, createdAt: Timestamp.now() });
  return ref;
};

export const getLatestUnpaidInvoiceId = async (
  parentId: string,
  childId: string,
  classId: string
) => {
  // BEZ orderBy, żeby nie wymagać indeksu złożonego
  const q = query(
    invoicesCollection,
    where("parentId", "==", parentId),
    where("childId", "==", childId),
    where("classId", "==", classId),
    where("status", "==", "unpaid")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  // posortuj lokalnie po createdAt malejąco
  const docs = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .sort((a, b) => {
      const ta = (a.createdAt?.toDate?.() ?? new Date(0)).getTime();
      const tb = (b.createdAt?.toDate?.() ?? new Date(0)).getTime();
      return tb - ta;
    });

  return docs[0]?.id || null;
};

export const markInvoiceAsPaid = async (invoiceId: string) => {
  const iref = doc(db, "invoices", invoiceId);
  await updateDoc(iref, { status: "paid", paidAt: Timestamp.now() });
  return iref;
};

// ---- Enrollment + first invoice (NOW USING getOfferingById)
export const createEnrollmentWithFirstInvoice = async ({
  parentId,
  childId,
  classId,
}: {
  parentId: string;
  childId: string;
  classId: string;
}) => {
  const cls = await getOfferingById(classId);
  if (!cls) throw new Error("Class not found");

  const billing = cls.billing || {};
  const model: BillingModel = billing.model || "monthly";
  const dueDays = num(billing.dueDays, 7);

  // 1) enrollment
  const enrRef = await addDoc(enrollmentsCollection, {
    parentId,
    childId,
    classId,
    status: "active",
    billingModel: model,
    enrollmentDate: Timestamp.now(),
  });

  // 2) invoice
  if (model === "monthly") {
    const billingDay = num(billing.billingDay, 1);
    const amount = num(billing.priceMonthly, 0);

    const now = new Date();
    const periodFrom = new Date(now.getFullYear(), now.getMonth(), billingDay);
    if (now > periodFrom) periodFrom.setMonth(periodFrom.getMonth() + 1);
    const periodTo = new Date(periodFrom);
    periodTo.setMonth(periodTo.getMonth() + 1);

    const due = new Date();
    due.setDate(due.getDate() + dueDays);

    await createInvoice({
      parentId,
      childId,
      classId,
      amount,
      currency: cls.currency || "PLN",
      status: "unpaid",
      dueDate: Timestamp.fromDate(due),
      period: { from: Timestamp.fromDate(periodFrom), to: Timestamp.fromDate(periodTo) },
      classDate: null,
    });
  } else {
    const amount = num(billing.pricePerLesson, 0);
    const due = new Date();
    due.setDate(due.getDate() + dueDays);

    await createInvoice({
      parentId,
      childId,
      classId,
      amount,
      currency: cls.currency || "PLN",
      status: "unpaid",
      dueDate: Timestamp.fromDate(due),
      period: null,
      classDate: Timestamp.fromDate(new Date()),
    });
  }

  return enrRef;
};

// ---- Start payment for invoice (mock flow)
export const startPaymentForInvoice = async ({
  invoiceId,
  payerEmail,
  returnUrl,               // ⬅ przekaż dalej do CF
}: {
  invoiceId: string;
  payerEmail: string;
  returnUrl: string;
}) => {
  const invRef = doc(db, "invoices", invoiceId);
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) throw new Error("Invoice not found");
  const inv = invSnap.data() as Invoice;

  const parentId = inv.parentId;
  const childSnap = await getDoc(doc(db, "children", inv.childId));
  const userSnap  = await getDoc(doc(db, "users", parentId));

  const studentName =
    childSnap.exists()
      ? `${(childSnap.data() as any).name ?? ""} ${(childSnap.data() as any).surname ?? ""}`.trim() || "Student"
      : "Student";
  const parentName =
    userSnap.exists()
      ? ((userSnap.data() as any).fullName || (userSnap.data() as any).name || "Parent")
      : "Parent";

  const base =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5001/perfect-tune/us-central1/api"
      : "https://us-central1-perfect-tune.cloudfunctions.net/api";

  // ⬇⬇⬇ DODAJ: success/failure + meta (opcjonalnie)
  const origin = window.location.origin;
  const successUrl = returnUrl || `${origin}/payments/return?invoiceId=${invoiceId}`;
  const failureUrl = `${origin}/payments/return?invoiceId=${invoiceId}&status=failed`;

  const res = await fetch(`${base}/initiatePayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(inv.amount),               // liczba – CF zrobi toFixed(2)
      description: inv.description || "Opłata za zajęcia",
      studentName,
      parentName,
      userId: parentId,
      email: payerEmail,
      returnUrl: successUrl,                    // ⬅ przekaż do CF
      successUrl,                               // ⬅ alias
      failureUrl,                               // ⬅ alias
      meta: { invoiceId, classId: inv.classId, childId: inv.childId, parentId },
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  const { gatewayUrl, form, redirectUrl } = await res.json();

  // preferuj bezpośredni redirect gdy backend go zwraca
  if (redirectUrl) return { redirectUrl };
  return { gatewayUrl, form }; // FE zrobi auto-POST
};



export const verifyPaymentAndMarkInvoice = async (invoiceId: string) => {
  const invRef = doc(db, "invoices", invoiceId);
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) throw new Error("Invoice not found");

  const inv = invSnap.data() as Invoice;
  if (!inv.paymentId) throw new Error("Invoice has no linked payment");

  const result = await tpay.verifyPayment(inv.paymentId);
  if (result?.success && result?.status === "completed") {
    await markInvoiceAsPaid(invoiceId);
    return true;
  }
  return false;
};
// --- Enrollment Requests (approval flow) ---

export const enrollmentRequestsCollection = collection(db, "enrollmentRequests");

export type EnrollmentRequestAction = "enroll" | "unenroll";
export type EnrollmentRequestStatus = "pending" | "approved" | "rejected";

export async function createEnrollmentRequest({
  parentId, childId, lessonId, action,
}: { parentId: string; childId: string; lessonId: string; action: "enroll"|"unenroll"; }) {
  const ref = await addDoc(collection(db, "enrollmentRequests"), {
    parentId, childId, lessonId, action,
    status: "pending",
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

/** Admin – lista wniosków (domyślnie pending) */
export const listEnrollmentRequests = async (
  status: "pending" | "approved" | "rejected" | "all" = "pending"
) => {
  const qRef =
    status === "all"
      ? enrollmentRequestsCollection
      : query(enrollmentRequestsCollection, where("status", "==", status));
  const snap = await getDocs(qRef);
  // sort po createdAt malejąco po stronie klienta
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .sort(
      (a, b) =>
        (b.createdAt?.toDate?.() ?? 0) - (a.createdAt?.toDate?.() ?? 0)
    );
};

const enrollmentIdFor = (childId: string, classId: string) => `${childId}_${classId}`;

async function createFirstInvoiceOnly({
  parentId, childId, classId,
}: { parentId: string; childId: string; classId: string; }) {
  const cls = await getOfferingById(classId);
  if (!cls) throw new Error("Class not found");

  const billing = cls.billing || {};
  const model: BillingModel = billing.model || "monthly";
  const dueDays = Number(billing.dueDays ?? 7);

  if (model === "monthly") {
    const billingDay = Number(billing.billingDay ?? 1);
    const amount = Number(billing.priceMonthly ?? 0);

    const now = new Date();
    const periodFrom = new Date(now.getFullYear(), now.getMonth(), billingDay);
    if (now > periodFrom) periodFrom.setMonth(periodFrom.getMonth() + 1);
    const periodTo = new Date(periodFrom); periodTo.setMonth(periodTo.getMonth() + 1);

    const due = new Date(); due.setDate(due.getDate() + dueDays);

    await createInvoice({
      parentId, childId, classId,
      amount,
      currency: cls.currency || "PLN",
      status: "unpaid",
      dueDate: Timestamp.fromDate(due),
      period: { from: Timestamp.fromDate(periodFrom), to: Timestamp.fromDate(periodTo) },
      classDate: null,
    });
  } else {
    const amount = Number(billing.pricePerLesson ?? 0);
    const due = new Date(); due.setDate(due.getDate() + dueDays);

    await createInvoice({
      parentId, childId, classId,
      amount,
      currency: cls.currency || "PLN",
      status: "unpaid",
      dueDate: Timestamp.fromDate(due),
      period: null,
      classDate: Timestamp.fromDate(new Date()),
    });
  }
}

/** Admin – akceptuje wniosek: tworzy enrollment + 1. fakturę */
export const approveEnrollmentRequest = async ({ requestId, adminId }: ApproveArgs) => {
  const nowSv = serverTimestamp();

  const reqRef = doc(db, "enrollmentRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found");

  const req = reqSnap.data() as any;
  if (req.status !== "pending") throw new Error("Request already processed");

  // normalizacja pól
  const action: "enroll" | "unenroll" = (req.action ?? req.op ?? "enroll");
  const classId: string = req.lessonId ?? req.classId;
  const childId: string = req.childId;
  const parentId: string = req.parentId;

  if (!classId || !childId || !parentId) {
    throw new Error("Missing classId/childId/parentId on request");
  }

  // meta lekcji/klasy (tytuł, billing, capacity)
  const cls = await getOfferingById(classId);
  if (!cls) throw new Error("Class not found");

  const enrollmentRef = doc(db, "enrollments", enrollmentIdFor(childId, classId));
  const enrollmentSnap = await getDoc(enrollmentRef);

  // aktywne statusy do liczenia pojemności
  const ACTIVE_STATUSES = ["active", "approved", "ongoing"];

  // --- preflight: capacity dla ENROLL ---
  if (action === "enroll") {
    const capacity = Number((cls as any)?.capacity ?? Infinity);
    if (Number.isFinite(capacity)) {
      const q = query(
        collection(db, "enrollments"),
        where("classId", "==", classId),
        where("status", "in", ACTIVE_STATUSES)
      );
      const activeSnap = await getDocs(q); // (opcjonalnie: getCountFromServer(q) jeśli wolisz)
      if (activeSnap.size >= capacity) {
        await updateDoc(reqRef, {
          status: "rejected",
          processedBy: adminId || null,
          processedAt: Timestamp.now(),
          reason: "Brak wolnych miejsc",
        });
        throw new Error("No free spots");
      }
    }
  }

  const batch = writeBatch(db);

  // referencje pomocnicze
  const lessonRef   = doc(db, "lessons", classId);
  const classRef    = doc(db, "classes", classId); // fallback jeśli masz też starą kolekcję
  const childRef    = doc(db, "children", childId);

  if (action === "enroll") {
    // jeśli już aktywny – nie duplikuj
    if (enrollmentSnap.exists() && ACTIVE_STATUSES.includes((enrollmentSnap.data() as any).status)) {
      batch.update(reqRef, {
        status: "approved",
        processedBy: adminId || null,
        processedAt: nowSv,
        enrollmentId: enrollmentRef.id,
        invoiceId: null,
      });
      await batch.commit();
      return { enrollmentId: enrollmentRef.id, invoiceId: null, note: "already active" };
    }

    // upsert → active
    const billingModel: BillingModel =
      (cls?.billing?.model as BillingModel) ||
      ((cls?.billing?.pricePerLesson != null || cls?.price != null) ? "per_lesson" : "monthly");

    batch.set(
      enrollmentRef,
      {
        parentId,
        childId,
        classId,
        status: "active",
        billingModel,
        enrollmentDate: enrollmentSnap.exists()
          ? ((enrollmentSnap.data() as any).enrollmentDate ?? Timestamp.now())
          : Timestamp.now(),
        updatedAt: nowSv,
        endedAt: null,
      },
      { merge: true }
    );

    // dopisz do participants (lessons lub fallback classes)
    batch.set(lessonRef, { participants: arrayUnion(childRef), updatedAt: nowSv }, { merge: true });
    // możesz pominąć fallback, jeśli już nie używasz "classes":
    // batch.set(classRef, { participants: arrayUnion(childRef), updatedAt: nowSv }, { merge: true });

    // zatwierdź request (invoiceId dołączymy po wystawieniu faktury)
    batch.update(reqRef, {
      status: "approved",
      processedBy: adminId || null,
      processedAt: nowSv,
      enrollmentId: enrollmentRef.id,
      invoiceId: null,
    });

    await batch.commit();

    // --- operacje po-commicie (nie rollbackują Firestore) ---
    try {
      await createFirstInvoiceOnly({ parentId, childId, classId });
    } catch {}

    let invoiceId: string | null = null;
    try {
      invoiceId = await getLatestUnpaidInvoiceId(parentId, childId, classId);
    } catch {}

    if (invoiceId) {
      await updateDoc(reqRef, { invoiceId }).catch(() => {});
    }

    await createNotification({
      userId: parentId,
      type: "enrollment_approved",
      title: "Zapis zaakceptowany",
      description: `Wniosek o zapis dziecka został zaakceptowany (${cls.title || classId}).`,
    }).catch(() => {});

    return { enrollmentId: enrollmentRef.id, invoiceId: invoiceId ?? null };
  }

  // ---------- UNENROLL ----------
  if (action === "unenroll") {
    // jeśli nie było zapisu – po prostu zamknij request
    if (!enrollmentSnap.exists()) {
      batch.update(reqRef, {
        status: "approved",
        processedBy: adminId || null,
        processedAt: nowSv,
        enrollmentId: null,
        invoiceId: null,
      });
      await batch.commit();

      await createNotification({
        userId: parentId,
        type: "enrollment_unenrolled",
        title: "Wypisanie zaakceptowane",
        description: `Wniosek o wypisanie dziecka został zaakceptowany (${cls.title || classId}).`,
      }).catch(() => {});
      return { enrollmentId: null, invoiceId: null, note: "not enrolled" };
    }

    // jeśli aktywny → zamknij + zdejmij z participants
    const currentStatus = (enrollmentSnap.data() as any).status;
    if (ACTIVE_STATUSES.includes(currentStatus)) {
      batch.update(enrollmentRef, {
        status: "inactive",
        endedAt: nowSv,
        updatedAt: nowSv,
      });

      // zdejmij z participants (lessons lub fallback classes)
      batch.set(lessonRef, { participants: arrayRemove(childRef), updatedAt: nowSv }, { merge: true });
      // batch.set(classRef, { participants: arrayRemove(childRef), updatedAt: nowSv }, { merge: true });
    }

    // zatwierdź request
    batch.update(reqRef, {
      status: "approved",
      processedBy: adminId || null,
      processedAt: nowSv,
      enrollmentId: enrollmentRef.id,
      invoiceId: null,
    });

    await batch.commit();

    // (opcjonalnie) anuluj przyszłe rozliczenia/harmonogram
    // await cancelFutureChargesFor({ childId, classId }).catch(() => {});

    await createNotification({
      userId: parentId,
      type: "enrollment_unenrolled",
      title: "Wypisanie zaakceptowane",
      description: `Wniosek o wypisanie dziecka został zaakceptowany (${cls.title || classId}).`,
    }).catch(() => {});

    return { enrollmentId: enrollmentRef.id, invoiceId: null };
  }

  throw new Error("Unknown action");
};



/** Admin – odrzuca wniosek */
export const rejectEnrollmentRequest = async ({
  requestId,
  adminId,
  reason,
}: {
  requestId: string;
  adminId: string;
  reason?: string;
}) => {
  const ref = doc(db, "enrollmentRequests", requestId);
  await updateDoc(ref, {
    status: "rejected",
    rejectedBy: adminId,
    rejectedAt: Timestamp.now(),
    reason: reason ?? null,
  });
  return ref;
};
export const addChildToLessonParticipants = async (lessonId: string, childId: string) => {
  const childRef = doc(db, "children", childId);

  const lessonRef = doc(db, "lessons", lessonId);
  const lessonSnap = await getDoc(lessonRef);
  if (lessonSnap.exists()) {
    await updateDoc(lessonRef, { participants: arrayUnion(childRef) });
    return;
  }

  const classRef = doc(db, "classes", lessonId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) throw new Error("Lesson/Class not found");
  await updateDoc(classRef, { participants: arrayUnion(childRef) });
};

export const removeChildFromLessonParticipants = async (lessonId: string, childId: string) => {
  const childRef = doc(db, "children", childId);

  const lessonRef = doc(db, "lessons", lessonId);
  const lessonSnap = await getDoc(lessonRef);
  if (lessonSnap.exists()) {
    await updateDoc(lessonRef, { participants: arrayRemove(childRef) });
    return;
  }

  const classRef = doc(db, "classes", lessonId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) throw new Error("Lesson/Class not found");
  await updateDoc(classRef, { participants: arrayRemove(childRef) });
};
export async function getUsersByIds(ids: string[]) {
  if (!ids.length) return [];
  // Firestore "in" ma limit 10 na zapytanie – zbatchuj gdy trzeba
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const results: any[] = [];
  for (const c of chunks) {
    const qRef = query(collection(db, "users"), where(documentId(), "in", c));
    const snap = await getDocs(qRef);
    snap.forEach(d => results.push({ id: d.id, ...d.data() }));
  }
  return results;
}

export async function getChildrenByIds(ids: string[]) {
  if (!ids.length) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const results: any[] = [];
  for (const c of chunks) {
    const qRef = query(collection(db, "children"), where(documentId(), "in", c));
    const snap = await getDocs(qRef);
    snap.forEach(d => results.push({ id: d.id, ...d.data() }));
  }
  return results;
}

export async function getClassesByIds(ids: string[]) {
  if (!ids.length) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const results: any[] = [];
  for (const c of chunks) {
    const qRef = query(collection(db, "classes"), where(documentId(), "in", c));
    const snap = await getDocs(qRef);
    snap.forEach(d => results.push({ id: d.id, ...d.data() }));
  }
  return results;
}


// Wniosek o wypisanie – zatwierdzenie przez admina (zakończenie enrollmentu, anulowanie przyszłych faktur, wyłączenie harmonogramów)
// Zwraca: { requestId, enrollmentId, cancelledInvoices, disabledSchedules, alreadyProcessed }
// Jeżeli request już zatwierdzony, zwraca alreadyProcessed=true i nic nie robi

type ApproveUnenrollArgs = {
  requestId: string;
  adminId: string;
};

export async function approveUnenrollRequest({ requestId, adminId }: ApproveUnenrollArgs) {
  const now = serverTimestamp();
  const requestRef = doc(db, "enrollmentRequests", requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error("Request not found");

  const req = requestSnap.data() as any;

  // wnioski rozróżniasz polem action === 'unenroll'
  const isUnenroll = (req.action ?? req.op) === "unenroll";
  if (!isUnenroll) throw new Error("This request is not an unenroll request");

  // idempotencja
  if (req.status && req.status !== "pending") {
    return {
      requestId,
      enrollmentId: req.enrollmentId ?? null,
      cancelledInvoices: 0,
      disabledSchedules: 0,
      alreadyProcessed: true,
    };
  }

  // data skuteczności (jeżeli nie podana – teraz)
  const effectiveFrom: Date =
    req.effectiveFrom?.toDate?.() ??
    (req.effectiveFrom instanceof Timestamp ? req.effectiveFrom.toDate() : undefined) ??
    new Date();

  // znajdź enrollment
  let enrollmentRef;
  if (req.enrollmentId) {
    enrollmentRef = doc(db, "enrollments", req.enrollmentId);
  } else {
    // dopasowanie po childId + lessonId (klucz w Twoim kodzie to lessonId)
    const enrQ = query(
      collection(db, "enrollments"),
      where("childId", "==", req.childId),
      where("classId", "==", req.lessonId),
      where("status", "in", ["active", "approved", "ongoing"]) // dopasuj, jeśli używasz innych statusów aktywnych
    );
    const enrSnap = await getDocs(enrQ);
    if (enrSnap.empty) throw new Error("Active enrollment not found for this child/lesson");
    enrollmentRef = enrSnap.docs[0].ref; // jeśli jest kilka – bierzemy pierwszy
  }

  // 1) Transakcja: zakończ enrollment + zatwierdź wniosek
  await runTransaction(db, async (tx) => {
    const [enrSnap, reqSnap] = await Promise.all([tx.get(enrollmentRef), tx.get(requestRef)]);
    if (!enrSnap.exists()) throw new Error("Enrollment not found");
    const reqData = reqSnap.data() as any;

    if (reqData.status && reqData.status !== "pending") return; // idempotencja

    // zakończ enrollment – w UI filtrujesz `status !== "inactive"`, więc ustawiamy "inactive"
    tx.update(enrollmentRef, {
      status: "inactive",
      endedAt: effectiveFrom,
      endReason: "unenroll_approved",
      endedByAdminId: adminId,
      updatedAt: now,
    });

    // wniosek → approved
    tx.update(requestRef, {
      status: "approved",
      processedBy: adminId,
      processedAt: now,
      enrollmentId: req.enrollmentId ?? enrSnap.id,
      effectiveFrom,
      updatedAt: now,
    });

    // (opcjonalnie) jeśli utrzymujesz listę uczestników w lessons/<id>.participants – usuń dziecko
    // const lessonRef = doc(db, "lessons", req.lessonId);
    // tx.update(lessonRef, { participants: arrayRemove(req.childId), updatedAt: now });
  });

  // 2) Po transakcji: anuluj przyszłe faktury dla childId + classId=lessonId
  const childId = req.childId;
  const classId = req.lessonId;

  let cancelledInvoices = 0;
  const invQ = query(
    collection(db, "invoices"),
    where("childId", "==", childId),
    where("classId", "==", classId),
    where("status", "in", ["open", "draft", "scheduled"]) // dopasuj do swoich statusów
  );
  {
    const invSnap = await getDocs(invQ);
    if (!invSnap.empty) {
      const batch = writeBatch(db);
      invSnap.forEach((d) => {
        const inv: any = d.data();
        const periodStart: Date | undefined =
          inv.periodStart?.toDate?.() ??
          (inv.periodStart instanceof Timestamp ? inv.periodStart.toDate() : undefined) ??
          (inv.issueDate?.toDate?.() ??
            (inv.issueDate instanceof Timestamp ? inv.issueDate.toDate() : undefined));

        if (!periodStart || periodStart >= effectiveFrom) {
          batch.update(d.ref, {
            status: "void",
            voidReason: "unenrolled",
            voidedAt: now,
            updatedAt: now,
          });
          cancelledInvoices++;
        }
      });
      if (cancelledInvoices > 0) await batch.commit();
    }
  }

  // 3) (opcjonalnie) wyłącz harmonogram (jeśli masz), np. invoiceSchedules
  let disabledSchedules = 0;
  {
    const schQ = query(
      collection(db, "invoiceSchedules"),
      where("childId", "==", childId),
      where("classId", "==", classId),
      where("active", "==", true)
    );
    const schSnap = await getDocs(schQ);
    if (!schSnap.empty) {
      const batch = writeBatch(db);
      schSnap.forEach((d) => {
        batch.update(d.ref, {
          active: false,
          cancelledAt: now,
          cancelledBy: adminId,
          cancelReason: "unenrolled",
          updatedAt: now,
        });
        disabledSchedules++;
      });
      await batch.commit();
    }
  }

  return {
    requestId,
    enrollmentId: req.enrollmentId ?? (await getDoc(enrollmentRef)).id,
    cancelledInvoices,
    disabledSchedules,
    alreadyProcessed: false,
  };
}



// --- END Enrollment Requests ---

// The file has been truncated. Please provide the rest of the file if you need further assistance.