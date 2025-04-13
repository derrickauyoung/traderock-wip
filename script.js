document.addEventListener("DOMContentLoaded", () => {

    const SUPABASE_URL = 'https://napmuiqctvbegldujfbb.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcG11aXFjdHZiZWdsZHVqZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MzQ1NzYsImV4cCI6MjA2MDExMDU3Nn0.U4SPKOZNpnhhTUzYdiRP_t8O0cAWKrefFrN_ic7jQ6g';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Expose supabase + placeBid globally if needed
    window.supabase = supabase;

    // ⚙️ Run after the page loads
    loadItems();
  
    // 📦 Load items from Supabase and render them
    async function loadItems() {
        const { data, error } = await supabase.from("items").select("*");

        if (error) {
            console.error("Error loading items:", error);
            alert("❌ Failed to load auction items.");
            return;
        }

        renderItems(data);
    }
    
    // 🎨 Render auction items to the page
    function renderItems(items) {
        const container = document.getElementById("items-container");
        container.innerHTML = ""; // Clear old items if reloading

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card";
            card.innerHTML = `
                <img src="${item.image_url}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p id="bid-${item.id}">Current Bid: $${item.current_bid}</p>
                <input type="number" id="input-${item.id}" placeholder="Enter your bid" />
                <button class="bid-btn" onclick="placeBid(${item.id})">Place Bid</button>
            `;
            container.appendChild(card);

            renderBidHistory(item.id, card);

            card.className = "item-card";
            card.setAttribute("data-id", item.id);
        });
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
        await loadItems(); // Reload all items from Supabase
        inputEl.value = "";
        alert("✅ Bid placed successfully!");

        await supabase.from("bids").insert([{
            item_id: id,
            amount: bidValue,
            bidder_name: "Anonymous" // Later we can replace this with real usernames
        }]);

        const itemCard = document.querySelector(`.item-card[data-id="${id}"]`);
        const oldHistory = itemCard.querySelector(".bid-history");
        if (oldHistory) oldHistory.remove(); // remove old list
        await renderBidHistory(id, itemCard); // re-render new list
    };
});