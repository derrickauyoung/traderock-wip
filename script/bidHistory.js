import { supabase } from './supabaseClient.js';

export async function renderBidHistory(itemId, container, currentUser) {
    // Remove any existing bid history wrapper first
    const existingWrapper = container.querySelector(".bid-history-wrapper");
    if (existingWrapper) {
        existingWrapper.remove();
    }

    const wrapper = document.createElement("div");
    wrapper.className = "bid-history-wrapper";
    wrapper.innerHTML = `
      <button class="toggle-history">Hide Bid History</button>
      <div class="bid-history shown">
        <h4>Bid History</h4>
        <ul class="bid-list"></ul>
      </div>
    `;
  
    container.appendChild(wrapper);
  
    const toggleBtn = wrapper.querySelector(".toggle-history");
    const historyDiv = wrapper.querySelector(".bid-history");
  
    toggleBtn.addEventListener("click", () => {
      historyDiv.classList.toggle("shown");
      toggleBtn.textContent = historyDiv.classList.contains("shown")
        ? "Hide Bid History"
        : "Show Bid History";
    });
  
    async function updateBidHistory() {
      const { data: bids, error } = await supabase
        .from("bids")
        .select("*")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching bid history:", error.message);
        return;
      }
  
      const list = historyDiv.querySelector(".bid-list");
      list.innerHTML = "";
  
      bids.forEach(bid => {
        const isOwnBid = currentUser && bid.bidder_name === currentUser.email;
        const userLabel = isOwnBid ? "You" : "Another user";
        const timestamp = new Date(bid.created_at).toLocaleString();
  
        const bidItem = document.createElement("li");
        bidItem.className = isOwnBid ? "your-bid" : "other-bid";
        bidItem.innerHTML = `
          <div class="bid-info">
            <span class="bid-user">${userLabel}</span>
            <span class="bid-amount">$${bid.amount}</span>
          </div>
          <div class="bid-time">${timestamp}</div>
        `;
        list.appendChild(bidItem);
      });
    }
  
    await updateBidHistory(); // Initial render
  
    // Setup realtime subscription
    supabase
      .channel(`bids:item-${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `item_id=eq.${itemId}`
        },
        payload => {
          updateBidHistory(); // Refresh bid list
        }
      )
      .subscribe();
  }
