import { supabase } from './supabaseClient.js';
  
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
        alert("❌ Please complete the hCaptcha.");
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
