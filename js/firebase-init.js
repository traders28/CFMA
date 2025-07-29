import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCzyrun_PEHPR1h7tPyLDDlCsL5tLfW5c",
  authDomain: "test-7005c.firebaseapp.com",
  databaseURL: "https://test-7005c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-7005c",
  storageBucket: "test-7005c.firebasestorage.app",
  messagingSenderId: "907627324585",
  appId: "1:907627324585:web:f2cfb2e04d91c117c0b5b8",
  measurementId: "G-2V4Y5T182E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { auth, database, signInWithEmailAndPassword, signInWithPopup, googleProvider, onAuthStateChanged, signOut, ref, set, get, child };