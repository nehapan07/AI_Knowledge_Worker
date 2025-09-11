import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGboa0ClWsrXTrmBZNUr3-oZ7Yp38dwW4",
  authDomain: "ai-worker-test-2.firebaseapp.com",
  projectId: "ai-worker-test-2",
  storageBucket: "ai-worker-test-2.appspot.com",
  messagingSenderId: "431921606057",
  appId: "1:431921606057:web:30852dac5f99835792e8b8",
  measurementId: "G-PSTB5S0RBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
