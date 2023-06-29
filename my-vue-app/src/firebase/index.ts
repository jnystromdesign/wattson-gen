import * as firebase from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = getAuth(app);

// // Sign up with email and password
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Additional user-related logic here
    console.log("Signed up user:", user);
  } catch (error) {
    console.error("Sign up failed:", error);
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Additional user-related logic here
    console.log("Signed in user:", user);
  } catch (error) {
    console.error("Sign in failed:", error);
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Sign out failed:", error);
  }
};

export const onLoginStateChange = onAuthStateChanged.bind({}, auth);
// // Listen for authentication state changes
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     // User is signed in
//     console.log("User is signed in:", user);
//   } else {
//     // User is signed out
//     console.log("User is signed out");
//   }
// });
