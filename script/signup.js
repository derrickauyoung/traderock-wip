import { supabase } from './supabaseClient.js';
import { verifyCaptcha } from './verify-captcha.js';

window.handleSignUp = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("message");
    const err = document.getElementById("error");
  
    msg.textContent = "Creating account, please wait ...";
    err.textContent = "";
  
    // Get hCaptcha token from the widget
    const token = hcaptcha.getResponse();

    if (!token) {
        alert("❌ Please complete the hCaptcha by logging out and in again.");
        return;
    }

    // 🔐 Verify with Supabase Edge Function
    const isHuman = await verifyCaptcha(token);
    if (!isHuman) {
        alert("❌ hCaptcha verification failed.");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      err.textContent = error.message;
    } else {
      msg.textContent = "Successfully created account!";
      window.location.href = "index.html";
    }
    hcaptcha.reset();
}

document.querySelector('#signup-btn').addEventListener('click', handleSignUp);

document.getElementById("captcha-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const token = hcaptcha.getResponse();
  if (!token) {
    alert("Please complete the hCaptcha by logging out and in again.");
    return;
  }

  const data = await verifyCaptcha(token);
  if (data) {
      console.log("CAPTCHA verified!");
      const button = document.getElementById("login-captcha-submit")
      button.hidden = true;
  } else {
      alert("❌ CAPTCHA failed.");
  }
});