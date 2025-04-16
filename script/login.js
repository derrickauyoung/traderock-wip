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
    // Get hCaptcha token from the widget
    const token = hcaptcha.getResponse();

    if (!token) {
        alert("❌ Please complete the hCaptcha.");
        return;
    }

    // 🔐 Verify with Supabase Edge Function
    const isHuman = await verifyCaptcha(token);
    if (!isHuman) {
        alert("❌ hCaptcha verification failed.");
        return;
    }

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    hcaptcha.reset();
  
    if (error) {
      document.getElementById("message").textContent = error.message;
    } else {
      window.location.href = "index.html"; // success redirect
    }
}

document.getElementById("captcha-form").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const token = hcaptcha.getResponse();
    if (!token) {
      alert("Please complete the CAPTCHA");
      return;
    }
  
    const data = await verifyCaptcha(token);
    if (data) {
        console.log("CAPTCHA verified!");
    // continue with rest of your form logic (like storing a bid or user input)
    } else {
        alert("❌ CAPTCHA failed.");
    }
});