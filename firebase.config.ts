// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnVkZNJQwdv8eXVuJtQqKC26F_3D7TOmY",
  authDomain: "expirytracker-a16ad.firebaseapp.com",
  projectId: "expirytracker-a16ad",
  storageBucket: "expirytracker-a16ad.appspot.com",
  messagingSenderId: "602534306821",
  appId: "1:602534306821:web:aa7e9eee5ae285c273a86c",
  measurementId: "G-K0NYRNDRBB",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
// const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp as firebase, auth, db };
