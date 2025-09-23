// functions/src/requests.ts (przykład HTTPS callable)
import * as functions from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

export const approveEnrollmentRequest = functions.https.onCall(async (data, ctx) => {
  const { requestId } = data;
  const reqSnap = await db.collection("enrollmentRequests").doc(requestId).get();
  if (!reqSnap.exists) throw new functions.https.HttpsError("not-found", "Request not found");

  const req = reqSnap.data()!;
  const { action, childId, lessonId, parentId } = req;

  if (!action || !childId || !lessonId) {
    throw new functions.https.HttpsError("failed-precondition", "Missing request data");
  }

  // dedupe helper
  const existing = await db.collection("enrollments")
    .where("childId","==",childId)
    .where("classId","==",lessonId)
    .limit(1)
    .get();

  if (action === "enroll") {
    if (!existing.empty && (existing.docs[0].data().status === "active")) {
      // już zapisany — nie duplikuj
      await reqSnap.ref.update({ status: "rejected", reason: "already_enrolled", processedAt: FieldValue.serverTimestamp() });
      return { ok: true, note: "already enrolled" };
    }

    // utwórz lub reaktywuj
    if (existing.empty) {
      await db.collection("enrollments").add({
        childId, classId: lessonId, parentId,
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      await existing.docs[0].ref.update({ status: "active", updatedAt: FieldValue.serverTimestamp() });
    }

    await reqSnap.ref.update({ status: "approved", processedAt: FieldValue.serverTimestamp() });
    return { ok: true };
  }

  if (action === "unenroll") {
    if (existing.empty) {
      await reqSnap.ref.update({ status: "rejected", reason: "not_enrolled", processedAt: FieldValue.serverTimestamp() });
      return { ok: true, note: "not enrolled" };
    }
    // oznacz jako inactive (nie twórz nowych wpisów!)
    await existing.docs[0].ref.update({ status: "inactive", endedAt: FieldValue.serverTimestamp() });
    await reqSnap.ref.update({ status: "approved", processedAt: FieldValue.serverTimestamp() });
    return { ok: true };
  }

  throw new functions.https.HttpsError("invalid-argument", "Unknown action");
});
