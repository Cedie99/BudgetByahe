import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARHaydqTnTbk43YNriQ5gNDcQ0mQ2ExY0",
  authDomain: "budget-byahe-ddfe5.firebaseapp.com",
  projectId: "budget-byahe-ddfe5",
  storageBucket: "budget-byahe-ddfe5.firebasestorage.app",
  messagingSenderId: "669673519583",
  appId: "1:669673519583:web:ab91bebdae016a8be42c6a",
  measurementId: "G-2MCZTVJ3V1",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const facebookProvider = new FacebookAuthProvider();

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  googleProvider,
  facebookProvider,
  doc,
  setDoc,
  getDoc,
};
