const supabase = supabase.createClient(
    "https://YOUR-PROJECT-ID.supabase.co",
    "public-anon-key"
);
  
async function handleSignUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("message");
    const err = document.getElementById("error");
  
    msg.textContent = "";
    err.textContent = "";
  
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
  
    if (error) {
        err.textContent = error.message;
    } else {
        msg.textContent = "Check your email to confirm your account!";
    }
}