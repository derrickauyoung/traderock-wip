import { supabase } from './supabaseClient.js';
import { verifyCaptcha } from './verify-captcha.js';
import { requestCaptchaToken } from "./captcha.js";

document.getElementById("login-btn").addEventListener("click", async () => {
    try {
        const token = await requestCaptchaToken();
        console.log("CAPTCHA passed with token:", token);
        // Continue with login...
        handleLogin();
    } catch (err) {
        console.warn("CAPTCHA cancelled or failed:", err);
    }
});

// Redirect if already logged in
async function checkLogin() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      window.location.href = "index.html"; // or your homepage
    }
  }
}

checkLogin();

window.handleLogin = async function() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      document.getElementById("message").textContent = error.message;
      hcaptcha.reset();
    } else {
      window.location.href = "../index.html"; // success redirect
    }
}
