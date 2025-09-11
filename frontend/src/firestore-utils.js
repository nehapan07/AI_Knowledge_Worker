import { db } from './firebase-config';
import { collection, getDocs } from "firebase/firestore";

export const fetchDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents: ", error);
    throw error;
  }
};
