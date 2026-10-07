import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, getFirestore, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const $ = (selector) => document.querySelector(selector);
const status = $("#auth-status");
const googleButton = $("#google-signin-button");
const emailButton = $("#email-verify-button");
const phoneButton = $("#phone-code-button");
const phoneConfirmButton = $("#phone-confirm-button");
const codeField = $("#phone-code-field");
const codeInput = $("#phone-verification-code");
const pendingEmailKey = "comradesoko.pending-email";

let auth;
let database;
let storage;
let recaptchaVerifier;
let phoneConfirmation;

function reportAuthError(error) {
  console.error("ComradeSoko authentication failed.", error);
  const commonMessages = {
    "auth/invalid-phone-number": "Enter a valid phone number with country code, for example +254712345678.",
    "auth/too-many-requests": "Too many attempts. Wait a while before trying again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/unauthorized-domain": "This website domain is not authorized in the Firebase project."
  };
  status.textContent = commonMessages[error.code] || `Authentication failed: ${error.message || error.code || "unknown error"}`;
}

function updateVerifiedUser(user) {
  const verified = Boolean(user && (user.phoneNumber || user.emailVerified));
  if (user) {
    if (user.displayName && !$("#profile-name").value) $("#profile-name").value = user.displayName;
    if (user.email) $("#auth-email").value = user.email;
    if (user.phoneNumber) {
      $("#auth-phone").value = user.phoneNumber;
      $("#profile-phone").value = user.phoneNumber;
    }
  }
  status.textContent = verified
    ? `Verified as ${user.phoneNumber || user.email}. You can optionally sync your profile and photo to Firebase.`
    : user
      ? "Verification is optional. Verify your email address or phone number to optionally sync your profile."
      : "Verification is optional. You can create a local profile without signing in.";
  window.dispatchEvent(new CustomEvent("comradesoko:auth-state", {
    detail: verified ? { uid: user.uid, email: user.email || "", phoneNumber: user.phoneNumber || "", emailVerified: user.emailVerified } : null
  }));
}

function ensureConfigured() {
  if (!isFirebaseConfigured) {
    status.textContent = "Authentication is not configured yet. Add this site’s Firebase web app settings and enable the sign-in methods.";
    return false;
  }
  return true;
}

async function createRecaptcha() {
  if (recaptchaVerifier) {
    await recaptchaVerifier.clear();
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });
  await recaptchaVerifier.render();
}

async function completeEmailLink() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;
  let email = localStorage.getItem(pendingEmailKey) || $("#auth-email").value.trim();
  if (!email) email = window.prompt("Enter the email address where you received the verification link.");
  if (!email) {
    status.textContent = "Enter the same email address used to request the verification link.";
    return;
  }
  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem(pendingEmailKey);
    window.history.replaceState({}, document.title, window.location.pathname);
    updateVerifiedUser(result.user);
    $("#account-dialog").showModal();
  } catch (error) {
    reportAuthError(error);
  }
}

function announceConfiguration() {
  status.textContent = "Optional Firebase sign-in is not configured. You can still create a local profile without verification.";
  googleButton.disabled = true;
  emailButton.disabled = true;
  phoneButton.disabled = true;
}

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getFirestore(app);
  storage = getStorage(app);
  onAuthStateChanged(auth, updateVerifiedUser, reportAuthError);
  completeEmailLink();
  window.ComradeSokoAuth = {
    getCurrentUser: () => auth.currentUser,
    async completeProfile(profile, photoFile) {
      const user = auth.currentUser;
      if (!user || !(user.phoneNumber || user.emailVerified)) {
        throw new Error("Verify your email or phone before saving your profile.");
      }
      if (!photoFile || !["image/jpeg", "image/png", "image/webp"].includes(photoFile.type) || photoFile.size > 5 * 1024 * 1024) {
        throw new Error("Upload a JPEG, PNG, or WebP profile photo no larger than 5 MB.");
      }
      const bitmap = await createImageBitmap(photoFile);
      const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("This browser could not prepare the profile photo.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const photoBlob = await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not compress the profile photo.")), "image/jpeg", 0.75));
      const avatarPath = `profile-photos/${user.uid}/profile.jpg`;
      await uploadBytes(ref(storage, avatarPath), photoBlob, { contentType: "image/jpeg" });
      const record = {
        ...profile,
        uid: user.uid,
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        emailVerified: user.emailVerified,
        phoneVerified: Boolean(user.phoneNumber),
        avatarPath,
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(database, "profiles", user.uid), record, { merge: true });
      return { ...profile, id: user.uid, email: record.email, phone: record.phoneNumber || profile.phone, avatarPath, verified: true };
    },
    async signOut() {
      await signOut(auth);
    }
  };
} else {
  announceConfiguration();
  window.ComradeSokoAuth = {
    getCurrentUser: () => null,
    async completeProfile() {
      throw new Error("Firebase authentication is not configured yet.");
    },
    async signOut() {}
  };
}

googleButton.addEventListener("click", async () => {
  if (!ensureConfigured()) return;
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    updateVerifiedUser(result.user);
  } catch (error) {
    reportAuthError(error);
  }
});

emailButton.addEventListener("click", async () => {
  if (!ensureConfigured()) return;
  const email = $("#auth-email").value.trim();
  if (!email) {
    status.textContent = "Enter your email address first.";
    $("#auth-email").focus();
    return;
  }
  try {
    await sendSignInLinkToEmail(auth, email, { url: window.location.href.split("?")[0], handleCodeInApp: true });
    localStorage.setItem(pendingEmailKey, email);
    status.textContent = `A secure sign-in and verification link was sent to ${email}. Open it on this device to continue.`;
  } catch (error) {
    reportAuthError(error);
  }
});

phoneButton.addEventListener("click", async () => {
  if (!ensureConfigured()) return;
  const phone = $("#auth-phone").value.trim();
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    status.textContent = "Enter a valid phone number in international format, for example +254712345678.";
    $("#auth-phone").focus();
    return;
  }
  try {
    await createRecaptcha();
    phoneConfirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    codeField.hidden = false;
    phoneConfirmButton.hidden = false;
    status.textContent = `A verification code was sent to ${phone}.`;
    codeInput.focus();
  } catch (error) {
    reportAuthError(error);
    if (recaptchaVerifier) {
      await recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  }
});

phoneConfirmButton.addEventListener("click", async () => {
  if (!phoneConfirmation) {
    status.textContent = "Request an SMS code first.";
    return;
  }
  const code = codeInput.value.trim();
  if (!/^\d{6}$/.test(code)) {
    status.textContent = "Enter the six-digit code from the SMS.";
    codeInput.focus();
    return;
  }
  try {
    const result = await phoneConfirmation.confirm(code);
    phoneConfirmation = null;
    updateVerifiedUser(result.user);
  } catch (error) {
    reportAuthError(error);
  }
});

$("#profile-photo").addEventListener("change", () => {
  const file = $("#profile-photo").files[0];
  if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
    $("#profile-photo").value = "";
    status.textContent = "Choose a JPEG, PNG, or WebP photo no larger than 5 MB.";
  }
});
