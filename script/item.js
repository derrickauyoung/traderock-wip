import { supabase } from './supabaseClient.js';
import { renderItem } from './render.js';
import { renderBidHistory } from './bidHistory.js';

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

    container.innerHTML = ""; // Clear old items
    const card = renderItem(container, item, user, bid_item_ids);

    // Render bid history under each card
    renderBidHistory(item.id, card, user);
}


loadItem();
