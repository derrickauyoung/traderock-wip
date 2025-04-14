import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { renderItem } from './render.js';

const supabaseUrl = 'https://napmuiqctvbegldujfbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcG11aXFjdHZiZWdsZHVqZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MzQ1NzYsImV4cCI6MjA2MDExMDU3Nn0.U4SPKOZNpnhhTUzYdiRP_t8O0cAWKrefFrN_ic7jQ6g';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const homebtn = document.createElement("button");
    homebtn.textContent = "Go back"
    homebtn.onclick = () => window.location.href = "index.html";
    container.appendChild(homebtn)
    const card = renderItem(container, item);

    // Render bid history under each card
    renderBidHistory(item.id, card);
}

async function renderBidHistory(itemId, container) {
    const { data: bids, error } = await supabase
      .from("bids")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Failed to load bid history:", error);
      return;
    }
  
    const list = document.createElement("ul");
    list.className = "bid-history";
  
    bids.forEach(bid => {
      const li = document.createElement("li");
      li.textContent = `$${bid.amount} by ${bid.bidder_name || "Anonymous"} on ${new Date(bid.created_at).toLocaleString()}`;
      list.appendChild(li);
    });
  
    container.appendChild(list);
}

loadItem();