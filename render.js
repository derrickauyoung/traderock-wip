// render.js
import { supabase } from './supabaseClient.js';
import {
    nextImage,
    prevImage,
    itemGalleryImages,
    itemGalleryIndex
} from './gallery.js';
import { renderBidHistory } from './bidHistory.js';
import { auction } from './constants.js';

export function renderItem(container, item, currentUser) {
    const card = document.createElement("div");
    card.id = `item-${item.id}`;
    card.className = "item-card";
    card.setAttribute("data-id", item.id);

    const imgGallery = document.createElement("div");
    imgGallery.className = "item-gallery"
    imgGallery.setAttribute("data-id", item.id);
    const firstImage = item.image_urls?.[0] || item.image_url;

    const prevButton = document.createElement("button");
    prevButton.className = "prev-btn";
    prevButton.textContent = "<";
    prevButton.onclick = () => prevImage(item.id);

    const img = document.createElement("img");
    img.src = firstImage
    img.alt = item.title;
    img.id = `img-${item.id}`;

    const nextButton = document.createElement("button");
    nextButton.className = "next-btn";
    nextButton.textContent = ">";
    nextButton.onclick = () => nextImage(item.id);

    imgGallery.appendChild(img)

    const imgGalleryBtns = document.createElement("div");
    imgGalleryBtns.appendChild(prevButton)
    imgGalleryBtns.appendChild(nextButton)

    imgGallery.appendChild(imgGalleryBtns)

    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = `item.html?id=${item.id}`;
    link.textContent = item.title;
    title.appendChild(link);

    const desc = document.createElement("div");
    desc.className = "item-desc";
    desc.textContent = item.description;

    card.appendChild(imgGallery);

    // Store current index in memory
    itemGalleryIndex[item.id] = 0;
    itemGalleryImages[item.id] = item.image_urls || [];

    card.appendChild(title);
    card.appendChild(desc);

    const bidSection = document.createElement("div");
    bidSection.className = "bid-section";

    // Buy now price
    const buyNow = document.createElement("div");
    buyNow.className = 'item-buynow';
    buyNow.textContent = `$${item.buy_now}`;
    bidSection.appendChild(buyNow);

    const datenow = Date.now();
    const timestamptzMillis = new Date(item.end_date).getTime();
    if (timestamptzMillis > datenow) {
        const bnButton = document.createElement("button");
        bnButton.id = `bnbtn-${item.id}`;
        bnButton.className = "bn-btn";
        bnButton.textContent = "Request Now";
        bnButton.onclick = () => placeBuyNow(item.id, card, item.buy_now);
        bidSection.appendChild(bnButton);
    }

    // Check if end date is past
    const end_date = document.createElement("div");
    end_date.className = "end-date";
    const endsAtDate = new Date(item.end_date);
    const formattedEndTime = endsAtDate.toLocaleString();
    const timeRemaining = timeUntil(item.end_date);
    end_date.textContent = `Offer ${timeRemaining} (${formattedEndTime})`;
    bidSection.appendChild(end_date);

    // Auction Bid Info
    if (auction()) {
        const priceInfo = document.createElement("div");

        const startingBidText = `<p><strong>Starting Bid:</strong> $${item.starting_bid}</p>`;

        const currentBid = item.current_bid ?? item.starting_bid;

        let currentBidText = "";
        if (item.current_bid !== null && currentBid !== item.starting_bid) {
            currentBidText = `<p id="bid-${item.id}"><strong>Current Bid:</strong> $${currentBid}</p>`;
        } else {
            currentBidText = `<p id="bid-${item.id}"></p>`; // empty element for consistent updating later
        }

        priceInfo.innerHTML = startingBidText + currentBidText;
        
        if (currentUser) {
            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = "Enter your bid";
            input.id = `input-${item.id}`;
        
            const bidButton = document.createElement("button");
            bidButton.className = "bid-btn";
            bidButton.textContent = "Place Bid";
            bidButton.onclick = () => placeBid(item.id, card);

            if (timestamptzMillis > datenow) {
                bidSection.appendChild(priceInfo);
                bidSection.appendChild(input);
                bidSection.appendChild(bidButton);
            }
        }
    }
    card.appendChild(bidSection);
    container.appendChild(card);

    window.placeBuyNow = async function(id, card, price) {
        const user = await authUser();

        if (!user) {
            console.error("User not logged in.");
            return;
        }
        
        // Close the auction and update bid history
        updateBidTable(user, price, id);

        // Update end time in Supabase
        const timestamptz = new Date().toISOString();
        const { error } = await supabase
            .from("items")
            .update({ end_date: timestamptz })
            .eq("id", id);
        
        if (error) {
            console.error("Error updating end date:", error);
            alert("❌ Something went wrong. Try again.");
            return;
        }

        // Update UI
        renderBidHistory(id, card, user);
        const buynowbtn = document.getElementById(`bnbtn-${id}`);
        buynowbtn.remove();
        alert("✅ Congrats on your purchase! Please contact seller.");
    };

    // Expose this function globally
    window.placeBid = async function(id, card) {
        const user = await authUser();

        if (!user) {
            console.error("User not logged in.");
            return;
        }

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

        // Update bid table
        updateBidTable(user, bidValue, id);
        
        // Update UI
        renderBidHistory(id, card, user);
        inputEl.value = "";
        alert("✅ Bid placed successfully!");
    };

    return card;
}

export async function authUser() {
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

    return user;
}

export async function updateBidTable(user, bidValue, id) {
    const bidder = user?.email
    if (bidder) {
        console.log("User email:", bidder);
    }
    else {
        console.error("Problem retrieving user email.");
        alert("❌ Please sign up or log in.");
        return;
    }
    
    // Check if there is already a bid at this price
    const { data: bids, error: bidsError } = await supabase
        .from("bids")
        .select("amount")
        .eq("item_id", id)
        .eq("amount", bidValue);
    if (bidsError) {
        console.error("Error retrieving current bids:", bidsError);
        alert("❌ Something went wrong. Try again.");
        return;
    }

    if (bids.length > 0) {
        console.warn("There is already a bid at this amount.");
        alert("🚫 Someone already placed this exact bid. Try a different amount.");
        return;
    }

    // Update bid in Supabase
    const { error: updateError } = await supabase
        .from("items")
        .update({ current_bid: bidValue })
        .eq("id", id);
    
    if (updateError) {
        console.error("Error updating bid:", updateError);
        alert("❌ Failed to update item.");
        return;
    }
    
    const { error: insertError } = await supabase.from("bids").insert([{
        item_id: id,
        amount: bidValue,
        bidder_name: bidder,
        user_id: user?.id
    }]);

    if (insertError) {
        console.error("Error inserting bid:", insertError);
        alert("❌ Failed to save bid. Try again.");
        return;
    }
}

// 🎨 Render auction items to the page
export function renderItems(items, currentUser) {
    const container = document.getElementById("items-container");
    container.innerHTML = ""; // Clear old items
  
    items.forEach(item => {
        renderItem(container, item, currentUser)
    });
}

export function timeUntil(date) {
    const now = new Date();
    const future = new Date(date);
    const seconds = Math.floor((future - now) / 1000);
  
    if (seconds <= 0) return "Ended";
  
    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
  
    for (const [unit, secondsPer] of Object.entries(intervals)) {
      const rawAmount = seconds / secondsPer;
      if (rawAmount >= 1) {
        const rounded = Math.round(rawAmount * 10) / 10; // 1 decimal
        return `ends in ${rounded} ${unit}${rounded !== 1 ? 's' : ''}`;
      }
    }
  
    return "ends in a few seconds";
  }
