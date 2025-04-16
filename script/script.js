import { renderItems } from './render.js';
import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            console.log("User not logged in.");
        }
    });    

    // Expose supabase + placeBid globally if needed
    window.supabase = supabase;
    
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
    
    document.getElementById("logout-link").addEventListener("click", (e) => {
        e.preventDefault();
        signOut();
    });

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

        const { data: { user } } = await supabase.auth.getUser();
        renderItems(data, user);
    }
});
