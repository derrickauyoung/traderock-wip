const SUPABASE_URL = 'https://napmuiqctvbegldujfbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcG11aXFjdHZiZWdsZHVqZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MzQ1NzYsImV4cCI6MjA2MDExMDU3Nn0.U4SPKOZNpnhhTUzYdiRP_t8O0cAWKrefFrN_ic7jQ6g';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadItems() {
    const { data, error } = await supabase.from("items").select("*");
    if (error) {
      console.error("Error loading items:", error);
      return;
    }
  
    renderItems(data);
}

document.addEventListener("DOMContentLoaded", () => {
    const items = loadItems();

    const container = document.getElementById("items-container");

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p id="bid-${item.id}">Current Bid: $${item.currentBid}</p>
            <input type="number" id="input-${item.id}" placeholder="Enter your bid" />
            <button class="bid-btn" onclick="placeBid(${item.id})">Place Bid</button>
        `;
        container.appendChild(card);
    });

    // Expose this function globally
    window.placeBid = async function(id) {
        const inputEl = document.getElementById(`input-${id}`);
        const bidValue = parseFloat(inputEl.value);
      
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
        currentBidEl.innerText = `Current Bid: $${bidValue}`;
        inputEl.value = "";
        alert("✅ Bid placed successfully!");
      };
});