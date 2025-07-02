// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAum-LhuOG7vrhkuAIsRcTSrJAzG0oTwoc",
  authDomain: "preply-f56e4.firebaseapp.com",
  projectId: "preply-f56e4",
  storageBucket: "preply-f56e4.firebasestorage.app",
  messagingSenderId: "967332767904",
  appId: "1:967332767904:web:b59651a1abdea86ad781c5",
  measurementId: "G-RPG83DB17C",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);


