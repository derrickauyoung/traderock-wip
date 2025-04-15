import { renderItems } from './render.js';
import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            console.log("User not logged in.");
        }
    });    

    let currentUser = null;

    async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
    }

    // Expose supabase + placeBid globally if needed
    window.supabase = supabase;

    window.signUp = async function() {
        const email = document.getElementById("auth-email").value;
        const password = document.getElementById("auth-password").value;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          alert("Sign Up Error: " + error.message);
        } else {
          alert("Successfully created account, logging in!");
          signIn();
        }
    }
      
    window.signIn = async function() {
        const email = document.getElementById("auth-email").value;
        const password = document.getElementById("auth-password").value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert("Login Error: " + error.message);
        } else {
            updateAuthStatus();
        }
    }
    
    window.signOut = async function() {
        await supabase.auth.signOut();
        updateAuthStatus();
        window.location.href = "index.html";
    }
    
    window.updateAuthStatus = async function() {
        const { data: { user } } = await supabase.auth.getUser();
        const statusEl = document.getElementById("auth-status");
        
        if (user) {
            statusEl.textContent = `Logged in as ${user.email}`;
        } else {
            statusEl.textContent = "Not logged in";
        }
    }
    
    updateAuthStatus();

    // Remove the hash fragment after login
    window.history.replaceState({}, document.title, window.location.pathname);

    // ⚙️ Run after the page loads
    loadItems();
    
    // 📦 Load items from Supabase and render them
    async function loadItems() {
        const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("Error loading items:", error);
            alert("❌ Failed to load auction items.");
            return;
        }

        renderItems(data, currentUser);
    }
});
