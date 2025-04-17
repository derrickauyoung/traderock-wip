import { supabase } from './supabaseClient.js';
import { verifyCaptcha } from './verify-captcha.js';

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
    const token = hcaptcha.getResponse();
  
    if (!token) {
        alert("❌ Please complete the hCaptcha by logging out and in again.");
        hcaptcha.reset();
        return;
    }

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

document.querySelector('#login-btn').addEventListener('click', handleLogin);

document.getElementById("captcha-form").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const statusEl = document.getElementById("captcha-status");

    // Get hCaptcha token from the widget
    const token = hcaptcha.getResponse();
  
    if (!token) {
        alert("❌ Please complete the hCaptcha by logging out and in again.");
        hcaptcha.reset();
    }
  
    // 🔐 Verify with Supabase Edge Function
    const isHuman = await verifyCaptcha(token);
    if (!isHuman) {
        alert("❌ hCaptcha verification failed.");
        hcaptcha.reset();
    }
    
    if (isHuman) {
        statusEl.textContent = `CAPTCHA verified!`;
    } else {
        statusEl.textContent = "CAPTCHA failed.";
        return;
    }
});