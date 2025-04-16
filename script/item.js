import { supabase } from '../supabaseClient.js';
import { renderItem } from './render.js';
import { renderBidHistory } from './bidHistory.js';
import { verifyCaptcha } from './verify-captcha.js';

async function loadItem() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    const container = document.getElementById("item-container");

    if (!itemId) {
        container.textContent = "Item not found.";
        return;
    }

    const { data: item, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

    if (error || !item) {
        container.textContent = "Item not found.";
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    container.innerHTML = ""; // Clear old items
    const card = renderItem(container, item, user);

    // Render bid history under each card
    renderBidHistory(item.id, card, user);
}


loadItem();

document.getElementById("captcha-form").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const token = hcaptcha.getResponse();
    if (!token) {
      alert("Please complete the CAPTCHA");
      return;
    }
  
    const data = await verifyCaptcha(token);
    if (data) {
        console.log("CAPTCHA verified!");
    // continue with rest of your form logic (like storing a bid or user input)
    } else {
        alert("❌ CAPTCHA failed.");
    }
});