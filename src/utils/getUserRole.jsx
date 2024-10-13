// src/utils/getUserRole.js
import db from "../firebase/firestore";
import auth from "../firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const getUserRole = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      return docSnap.data().role; // Return the user's role
    } else {
      console.log("No such document!");
    }
  }
  return null; // User not logged in or role not found
};

export default getUserRole;
