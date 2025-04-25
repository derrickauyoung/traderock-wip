import { supabase } from './supabaseClient.js';
import { requestCaptchaToken } from "./captcha.js";

document.getElementById("signup-btn").addEventListener("click", async () => {
    try {
        const token = await requestCaptchaToken();
        console.log("CAPTCHA passed with token:", token);
        // Continue with signup...
        handleSignUp();
    } catch (err) {
        console.warn("CAPTCHA cancelled or failed:", err);
    }
});

window.handleSignUp = async function() {
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
