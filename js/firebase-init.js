import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, push } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYqs-bITRb95FzStcrcuqr6AbvPVI4aMY",
  authDomain: "afma-3edb6.firebaseapp.com",
  databaseURL: "https://afma-3edb6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "afma-3edb6",
  storageBucket: "afma-3edb6.firebasestorage.app",
  messagingSenderId: "22667793029",
  appId: "1:22667793029:web:0eea82fa8e8f68935f0fec",
  measurementId: "G-M1PEMWM50H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, database, signInWithEmailAndPassword, signInWithPopup, googleProvider, onAuthStateChanged, signOut, ref, set, get, child, update, push, getStorage, storageRef, uploadBytes, getDownloadURL };