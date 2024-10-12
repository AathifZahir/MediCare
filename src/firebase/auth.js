// auth.js
import app from "./firebase"; // Import the initialized app
import { getAuth } from "firebase/auth";

const auth = getAuth(app);
export default auth;
