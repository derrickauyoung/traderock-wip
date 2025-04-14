import {
    nextImage,
    prevImage,
    itemGalleryImages,
    itemGalleryIndex
} from './gallery.js';

import { renderItems } from './render.js';

document.addEventListener("DOMContentLoaded", () => {

    const SUPABASE_URL = 'https://napmuiqctvbegldujfbb.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcG11aXFjdHZiZWdsZHVqZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MzQ1NzYsImV4cCI6MjA2MDExMDU3Nn0.U4SPKOZNpnhhTUzYdiRP_t8O0cAWKrefFrN_ic7jQ6g';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            window.location.href = "login.html";
        }
    });    

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
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            loadItems();
        }
    });
  
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

        renderItems(data);
    }

    // Expose this function globally
    window.placeBid = async function(id) {
        const inputEl = document.getElementById(`input-${id}`);
        const bidValue = parseFloat(inputEl.value);

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (user) {
            console.log("Signed in.")
        }
        else {
            alert("❌ Please sign up or log in.");
            return;
        }
        
        if (isNaN(bidValue)) {
            alert("❌ Please enter a valid number.");
            return;
        }
        
        // Get current item info from the DOM
        const currentBidEl = document.getElementById(`bid-${id}`);
        const currentBidText = currentBidEl.innerText;
        const currentBid = parseFloat(currentBidText.replace("Current Bid: $", ""));
        
        if (bidValue <= currentBid) {
            alert("🚫 Your bid must be higher than the current bid.");
            return;
        }
        
        // Update bid in Supabase
        const { error } = await supabase
            .from("items")
            .update({ current_bid: bidValue })
            .eq("id", id);
        
        if (error) {
            console.error("Error updating bid:", error);
            alert("❌ Something went wrong. Try again.");
            return;
        }
        
        // Update UI
        await loadItems(); // Reload all items from Supabase
        inputEl.value = "";
        alert("✅ Bid placed successfully!");

        await supabase.from("bids").insert([{
            item_id: id,
            amount: bidValue,
            bidder_name: user?.email || "Anonymous", // or store user.id instead
            user_id: user?.id // if you want to add that to your bids table
        }]);

        // go to bid item page
        window.location.href = `item.html?id=${id}`;
        //const itemCard = document.querySelector(`.item-card[data-id="${id}"]`);
        //const oldHistory = itemCard.querySelector(".bid-history");
        //if (oldHistory) oldHistory.remove(); // remove old list
        //await renderBidHistory(id, itemCard); // re-render new list
    };
});
