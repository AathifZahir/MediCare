// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4fLAwnekULYYqdJznAk2Yoq5IKSj-XCY",
  authDomain: "medicare-lk.firebaseapp.com",
  projectId: "medicare-lk",
  storageBucket: "medicare-lk.appspot.com",
  messagingSenderId: "246049130186",
  appId: "1:246049130186:web:5e189a6e3be822e8871633",
  measurementId: "G-TN8DH02SDR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
