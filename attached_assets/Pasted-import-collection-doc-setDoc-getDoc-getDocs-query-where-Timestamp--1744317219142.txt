import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";

// Collection references
const usersCollection = collection(db, "users");
const childrenCollection = collection(db, "children");
const classesCollection = collection(db, "classes");
const enrollmentsCollection = collection(db, "enrollments");
const paymentsCollection = collection(db, "payments");
const attendanceCollection = collection(db, "attendance");
const workshopsCollection = collection(db, "workshops");

// Initial classes data
const initialClasses = [
  {
    name: "Piano for Beginners",
    type: "instrument",
    description: "Introductory piano lessons for young children with no prior experience.",
    instructor: "Sarah Johnson",
    schedule: {
      days: ["Monday", "Wednesday"],
      startTime: "15:00",
      endTime: "16:00"
    },
    location: "Studio A",
    capacity: 8,
    enrolledStudents: 5,
    price: 150,
    ageRange: "5-8",
    status: "active",
    startDate: "2025-01-15",
    createdAt: Timestamp.now()
  },
  {
    name: "Guitar Fundamentals",
    type: "instrument",
    description: "Learn basic guitar chords, strumming patterns, and simple songs.",
    instructor: "David Miller",
    schedule: {
      days: ["Tuesday", "Thursday"],
      startTime: "16:00",
      endTime: "17:00"
    },
    location: "Studio B",
    capacity: 6,
    enrolledStudents: 4,
    price: 160,
    ageRange: "9-12",
    status: "active",
    startDate: "2025-01-16",
    createdAt: Timestamp.now()
  },
  {
    name: "Vocal Training",
    type: "vocal",
    description: "Develop proper singing technique, breath control, and vocal range.",
    instructor: "Emily Wilson",
    schedule: {
      days: ["Friday"],
      startTime: "17:00",
      endTime: "18:30"
    },
    location: "Studio C",
    capacity: 10,
    enrolledStudents: 7,
    price: 175,
    ageRange: "10-15",
    status: "active",
    startDate: "2025-01-17",
    createdAt: Timestamp.now()
  },
  {
    name: "Music Theory",
    type: "theory",
    description: "Introduction to reading music, rhythm, scales, and music notation.",
    instructor: "Robert Davis",
    schedule: {
      days: ["Monday"],
      startTime: "17:00",
      endTime: "18:00"
    },
    location: "Classroom 1",
    capacity: 12,
    enrolledStudents: 9,
    price: 120,
    ageRange: "8-14",
    status: "active",
    startDate: "2025-01-20",
    createdAt: Timestamp.now()
  },
  {
    name: "Drums Workshop",
    type: "instrument",
    description: "Learn drum basics, rhythms, and coordination skills.",
    instructor: "Michael Brown",
    schedule: {
      days: ["Wednesday"],
      startTime: "16:30",
      endTime: "17:30"
    },
    location: "Studio D",
    capacity: 6,
    enrolledStudents: 3,
    price: 180,
    ageRange: "10-16",
    status: "active",
    startDate: "2025-01-22",
    createdAt: Timestamp.now()
  }
];

// Initial workshops data
const initialWorkshops = [
  {
    name: "Summer Music Camp",
    description: "A week-long intensive program covering multiple instruments, music theory, and ensemble playing.",
    category: "camp",
    date: "2025-07-10",
    time: "9:00 AM - 3:00 PM",
    location: "Main Hall",
    price: 350,
    capacity: 25,
    spotsLeft: 18,
    imageUrl: "https://images.unsplash.com/photo-1525342380973-596771d8a18f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    createdAt: Timestamp.now()
  },
  {
    name: "Jazz Improvisation",
    description: "Learn the basics of jazz improvisation, scales, and techniques.",
    category: "specialized",
    date: "2025-03-15",
    time: "2:00 PM - 5:00 PM",
    location: "Studio B",
    price: 95,
    capacity: 12,
    spotsLeft: 7,
    imageUrl: "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    createdAt: Timestamp.now()
  },
  {
    name: "Songwriting Workshop",
    description: "Explore the art of songwriting - from lyrics to melody, structure, and arrangement.",
    category: "creative",
    date: "2025-04-05",
    time: "1:00 PM - 4:00 PM",
    location: "Classroom 2",
    price: 85,
    capacity: 15,
    spotsLeft: 11,
    imageUrl: "https://images.unsplash.com/photo-1520446266423-6daca23fe8c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    createdAt: Timestamp.now()
  },
  {
    name: "Music Production Basics",
    description: "Introduction to digital audio workstations, recording, and mixing techniques.",
    category: "technology",
    date: "2025-02-25",
    time: "3:00 PM - 6:00 PM",
    location: "Digital Lab",
    price: 110,
    capacity: 10,
    spotsLeft: 5,
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    createdAt: Timestamp.now()
  }
];

// Mark admin user in Firestore
export const markUserAsAdmin = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await setDoc(userRef, { 
        ...userSnap.data(),
        role: "admin",
        updatedAt: Timestamp.now()
      }, { merge: true });
      console.log("User marked as admin successfully");
    } else {
      console.error("User does not exist");
    }
  } catch (error) {
    console.error("Error marking user as admin:", error);
    throw error;
  }
};

// Initialize Firestore with sample data
export const initializeFirestore = async (): Promise<void> => {
  try {
    // Check if classes already exist to avoid duplication
    const classesQuery = query(classesCollection);
    const classesSnapshot = await getDocs(classesQuery);
    
    if (classesSnapshot.empty) {
      console.log("Initializing classes in Firestore...");
      for (const classData of initialClasses) {
        const docRef = doc(classesCollection);
        await setDoc(docRef, classData);
      }
      console.log("Classes initialized successfully");
    } else {
      console.log("Classes already exist in Firestore");
    }

    // Check if workshops already exist to avoid duplication
    const workshopsQuery = query(workshopsCollection);
    const workshopsSnapshot = await getDocs(workshopsQuery);
    
    if (workshopsSnapshot.empty) {
      console.log("Initializing workshops in Firestore...");
      for (const workshopData of initialWorkshops) {
        const docRef = doc(workshopsCollection);
        await setDoc(docRef, workshopData);
      }
      console.log("Workshops initialized successfully");
    } else {
      console.log("Workshops already exist in Firestore");
    }
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    throw error;
  }
};

// Get all existing collections data for initial development/debugging
export const getFirestoreCollections = async (): Promise<{ [key: string]: any[] }> => {
  try {
    const collections: { [key: string]: any[] } = {
      users: [],
      children: [],
      classes: [],
      enrollments: [],
      payments: [],
      attendance: [],
      workshops: []
    };
    
    // Get users
    const usersSnapshot = await getDocs(usersCollection);
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      collections.users.push({ id: doc.id, ...data });
    });
    
    // Get classes
    const classesSnapshot = await getDocs(classesCollection);
    classesSnapshot.forEach((doc) => {
      const data = doc.data();
      collections.classes.push({ id: doc.id, ...data });
    });
    
    // Get workshops
    const workshopsSnapshot = await getDocs(workshopsCollection);
    workshopsSnapshot.forEach((doc) => {
      const data = doc.data();
      collections.workshops.push({ id: doc.id, ...data });
    });
    
    // Get children (optional for development)
    const childrenSnapshot = await getDocs(childrenCollection);
    childrenSnapshot.forEach((doc) => {
      const data = doc.data();
      collections.children.push({ id: doc.id, ...data });
    });
    
    return collections;
  } catch (error) {
    console.error("Error getting Firestore collections:", error);
    throw error;
  }
};