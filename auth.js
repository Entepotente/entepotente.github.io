import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider,
  sendEmailVerification, sendPasswordResetEmail, updateProfile, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* 1) Pega aquí tu configuración (Firebase Console > Configuración del proyecto > Tus apps > Web) */
const firebaseConfig = {
  apiKey: "AIzaSyC7ahpBgP3BhemuGVyfAlsCl57VzgbaPEc",
  authDomain: "beatcut-f03ea.firebaseapp.com",
  projectId: "beatcut-f03ea",
  appId: "1:1091679284524:web:4c503285f59b767e611089"
};

const $ = id => document.getElementById(id);
const msg = (t, ok) => { const m = $("msg"); m.textContent = t || ""; m.dataset.ok = ok ? "1" : ""; };

if (firebaseConfig.apiKey === "TU_API_KEY") /* sin configurar */ {
  msg("Falta configurar Firebase en auth.js (consulta las instrucciones).");
  document.querySelectorAll("#authForms button").forEach(b => b.disabled = true);
} else {
  const auth = getAuth(initializeApp(firebaseConfig));
  auth.languageCode = "es";

  const errors = {
    "auth/invalid-email": "El correo no es válido.",
    "auth/missing-password": "Escribe la contraseña.",
    "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Prueba a iniciar sesión.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
    "auth/popup-closed-by-user": "Cerraste la ventana antes de terminar.",
    "auth/cancelled-popup-request": "Cerraste la ventana antes de terminar.",
    "auth/popup-blocked": "Tu navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.",
    "auth/account-exists-with-different-credential": "Ese correo ya está registrado con otro método de acceso.",
    "auth/operation-not-allowed": "Este método de acceso aún no está activado.",
    "auth/network-request-failed": "Error de conexión. Inténtalo de nuevo."
  };
  const fail = e => msg(errors[e.code] || "No se ha podido completar la operación.");
  const pwOk = p => p.length >= 8;

  let mode = "login";
  const setMode = m => {
    mode = m;
    document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === m));
    $("nameRow").hidden = $("termsRow").hidden = m !== "register";
    $("submit").textContent = m === "register" ? "Crear cuenta" : "Entrar";
    $("pass").autocomplete = m === "register" ? "new-password" : "current-password";
    $("forgot").hidden = m !== "login";
    msg("");
  };
  document.querySelectorAll("#tabs button").forEach(b => b.addEventListener("click", () => setMode(b.dataset.m)));

  $("emailForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("email").value.trim(), pass = $("pass").value;
    $("submit").disabled = true;
    try {
      if (mode === "register") {
        if (!pwOk(pass)) throw { code: "auth/weak-password" };
        if (!$("terms").checked) { msg("Debes aceptar la política de privacidad."); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const name = $("name").value.trim();
        if (name) await updateProfile(cred.user, { displayName: name });
        await sendEmailVerification(cred.user);
        msg("Cuenta creada. Te hemos enviado un correo para verificarla.", true);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (err) { fail(err); }
    finally { $("submit").disabled = false; }
  });

  $("forgot").addEventListener("click", async () => {
    const email = $("email").value.trim();
    if (!email) { msg("Escribe tu correo arriba y vuelve a pulsar."); return; }
    try { await sendPasswordResetEmail(auth, email); msg("Si el correo existe, recibirás un enlace para restablecer la contraseña.", true); }
    catch (err) { fail(err); }
  });

  const providers = {
    google: () => { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" }); return p; },
    facebook: () => new FacebookAuthProvider(),
    apple: () => { const p = new OAuthProvider("apple.com"); p.addScope("email"); p.addScope("name"); return p; }
  };
  document.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", async () => {
    try { await signInWithPopup(auth, providers[b.dataset.p]()); } catch (err) { fail(err); }
  }));

  $("logout").addEventListener("click", () => signOut(auth));
  $("resend").addEventListener("click", async () => {
    try { await sendEmailVerification(auth.currentUser); msg("Correo de verificación enviado.", true); } catch (err) { fail(err); }
  });

  onAuthStateChanged(auth, u => {
    $("authForms").hidden = !!u;
    $("account").hidden = !u;
    if (u) {
      $("who").textContent = u.displayName || u.email || "Usuario";
      $("whoMail").textContent = u.email || "";
      $("resend").hidden = u.emailVerified || !u.email;
      $("verified").textContent = u.email ? (u.emailVerified ? "Correo verificado" : "Correo sin verificar") : "";
      msg("");
    }
  });
  setMode("login");
}
