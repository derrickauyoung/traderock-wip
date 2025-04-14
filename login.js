const supabase = supabase.createClient(
    "https://YOUR-PROJECT-ID.supabase.co",
    "public-anon-key"
);

// Redirect if already logged in
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      window.location.href = "index.html"; // or your homepage
    }
});

async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      document.getElementById("message").textContent = error.message;
    } else {
      window.location.href = "index.html"; // success redirect
    }
}