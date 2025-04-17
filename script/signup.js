import { supabase } from './supabaseClient.js';
import { verifyCaptcha } from './verify-captcha.js';

window.handleSignUp = async function() {
    // Get hCaptcha token from the widget
    const token = hcaptcha.getResponse();

    if (!token) {
        alert("❌ Please complete the hCaptcha by logging out and in again.");
        hcaptcha.reset();
        return;
    }

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("message");
    const err = document.getElementById("error");
  
    msg.textContent = "Creating account, please wait ...";
    err.textContent = "";

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      err.textContent = error.message;
      hcaptcha.reset();
    } else {
      msg.textContent = "Successfully created account!";
      window.location.href = "../index.html";
    }
}

document.querySelector('#signup-btn').addEventListener('click', handleSignUp);

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