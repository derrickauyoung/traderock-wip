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
        const { data: items, error } = await supabase
            .from("items")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("Error loading items:", error);
            alert("❌ Failed to load auction items.");
            return;
        }

        const { data: bids, error: bidsError } = await supabase
        .from("bids")
        .select("item_id")
        .order("item_id", { ascending: true });

        if (bidsError) {
            console.error("Error retrieving current bids:", bidsError);
            alert("❌ Something went wrong. Try again.");
            return;
        }

        const bid_item_ids = [];
        bids.forEach(bid => {
            bid_item_ids.push(bid.item_id)
        });

        const { data: { user } } = await supabase.auth.getUser();
        renderItems(items, user, bid_item_ids);
    }
});
