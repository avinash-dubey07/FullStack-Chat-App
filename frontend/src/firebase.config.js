import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdp3u_aLi0WDxnZ6f4UyzltOF4nTx8vfY",
  authDomain: "gabby-chat-app.firebaseapp.com",
  projectId: "gabby-chat-app",
  storageBucket: "gabby-chat-app.firebasestorage.app",
  messagingSenderId: "281698213202",
  appId: "1:281698213202:web:33d6948ba98518bb536e8b",
  clientId: "1036419903880-5m0ro850e3bsnikltnarnki63fn8fqr2.apps.googleusercontent.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };