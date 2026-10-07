export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  messagingSenderId: "",
  storageBucket: "",
  appId: ""
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
