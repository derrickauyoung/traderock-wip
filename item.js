import { supabase } from './supabaseClient.js';
import { renderItem } from './render.js';
import { renderBidHistory } from './bidHistory.js';

let currentUser = null;

async function fetchCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
}

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

    container.innerHTML = ""; // Clear old items
    const containerdiv = document.createElement("div");
    containerdiv.className = "home-div";
    const homebtn = document.createElement("button");
    homebtn.className = "home-btn";
    homebtn.textContent = "Go back"
    homebtn.onclick = () => window.location.href = "index.html";
    containerdiv.appendChild(homebtn)
    container.appendChild(containerdiv)
    const card = renderItem(container, item);

    // Render bid history under each card
    renderBidHistory(item.id, card, currentUser);
}


loadItem();
