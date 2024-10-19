import db from "../firebase/firestore";
import auth from "../firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const getUserRoleAndHospital = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return {
        role: userData.role,
        hospitalId: userData.hospital, // Return both role and hospital ID
      };
    } else {
      console.log("No such document!");
    }
  }
  return null; // User not logged in or role not found
};

export default getUserRoleAndHospital;
