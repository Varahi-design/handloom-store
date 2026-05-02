import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJaB8eqxYJAluDIcgTUsRJ5Win7L0nFgs",
  authDomain: "handloom-store.firebaseapp.com",
  projectId: "handloom-store",
  storageBucket: "handloom-store.firebasestorage.app",
  messagingSenderId: "113171757206",
  appId: "1:113171757206:web:e58fb30ce7dc26eb646ab7",
  measurementId: "G-FJYXS6VC87"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);