import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-b09ee.firebaseapp.com",
  projectId: "interviewiq-b09ee",
  storageBucket: "interviewiq-b09ee.firebasestorage.app",
  messagingSenderId: "330066840194",
  appId: "1:330066840194:web:d4de83894f16bccf6a029b"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider};