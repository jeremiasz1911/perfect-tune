import { getDocs, updateDoc, collection, doc, getDoc, DocumentReference } from "firebase/firestore";
import { db } from "../lib/firebase"; // dostosuj ścieżkę do swojego pliku konfiguracyjnego Firebase

class ChildManager {
  async deleteChild(childId: string): Promise<void> {
    await this.deleteChildFromUsers(childId);
    await this.deleteChildFromClasses(childId);
    await this.deleteChildFromGroups(childId);
    await this.deleteChildFromLessons(childId);
    // Dodaj inne kolekcje jeśli trzeba (np. payments, workshops)
  }

  private async deleteChildFromUsers(childId: string) {
    const usersSnapshot = await getDocs(collection(db, "users"));
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const children = userData.children || [];

      const updatedChildren = children.filter((child: any) => child.id !== childId);
      if (updatedChildren.length !== children.length) {
        await updateDoc(userDoc.ref, { children: updatedChildren });
      }
    }
  }

  private async deleteChildFromClasses(childId: string) {
    const classesSnapshot = await getDocs(collection(db, "classes"));
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const children = classData.children || [];
4
      const updatedChildren = children.filter((id: string) => id !== childId);
      if (updatedChildren.length !== children.length) {
        await updateDoc(classDoc.ref, { children: updatedChildren });
      }
    }
  }

  private async deleteChildFromGroups(childId: string) {
    const groupsSnapshot = await getDocs(collection(db, "groups"));
    for (const groupDoc of groupsSnapshot.docs) {
      const groupData = groupDoc.data();
      const children = groupData.children || [];


      // if children is exists in group then delete !
      if(children.filter((id: string) => !id.includes(childId))){
        const updatedChildren = children.filter((id: string) => !id.includes(childId));
        if (updatedChildren.length !== children.length) {
          await updateDoc(groupDoc.ref, { children: updatedChildren });
        }
      }
    }
  }

  private async deleteChildFromLessons(childId: string) {
    const lessonsSnapshot = await getDocs(collection(db, "lessons"));
    for (const lessonDoc of lessonsSnapshot.docs) {
      const lessonData = lessonDoc.data();
      const participants = lessonData.participants || [];

      // if participants is exists in lesson then delete !
      if (participants) {
        console.log("Deleting child from lesson participants:", lessonData.title, participants.id);
        // Filter out the childId from participants
      
        const updatedParticipants = participants.filter((participant: any) => participant.id !== childId);
        if (updatedParticipants.length !== participants.length) {
          await updateDoc(lessonDoc.ref, { participants: updatedParticipants });
        }
      }
    }
  }

  public fetchParticipantsData = async (participants: DocumentReference[]) => {
    const data = await Promise.all(
      participants.map(async (ref) => {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          return { id: snap.id, ...(snap.data() as any) };
        }
        return null;
      })
    );
    return data.filter((p) => p !== null);
  };

}


// Eksportuj jako singleton (instancję klasy)
export const childManager = new ChildManager();
