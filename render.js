// render.js
import { supabase } from './supabaseClient.js';
import {
    nextImage,
    prevImage,
    itemGalleryImages,
    itemGalleryIndex
} from './gallery.js';
import { renderBidHistory } from './bidHistory.js';

export function renderItem(container, item, currentUser) {
    const card = document.createElement("div");
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

    card.appendChild(imgGallery);

    // Store current index in memory
    itemGalleryIndex[item.id] = 0;
    itemGalleryImages[item.id] = item.image_urls || [];

    card.appendChild(title);
    if (item.description !== null) {
        card.appendChild(desc);
    }
    card.appendChild(priceInfo);

    // Check if end date is past
    const end_date = document.createElement("div");
    end_date.className = "end-date";
    const end_date_text = `<p><strong>Auction ends:</strong> ${item.end_date}</p>`;
    end_date.innerHTML = end_date_text;
    card.append(end_date);
    
    if (currentUser) {
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "Enter your bid";
        input.id = `input-${item.id}`;
    
        const button = document.createElement("button");
        button.className = "bid-btn";
        button.textContent = "Place Bid";
        button.onclick = () => placeBid(item.id, card);

        const timestamptzMillis = new Date(item.end_date).getTime();
        if (timestamptzMillis > Date.now()) {
            card.appendChild(input);
            card.appendChild(button);
        }
    }
    container.appendChild(card);

    // Expose this function globally
    window.placeBid = async function(id, card) {
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

        const bidder = user?.email
        if (bidder) {
            console.log("User email:", bidder);
        }
        else {
            console.error("Problem retrieving user email.");
            alert("❌ Please sign up or log in.");
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
        
        await supabase.from("bids").insert([{
            item_id: id,
            amount: bidValue,
            bidder_name: bidder,
            user_id: user?.id // if you want to add that to your bids table
        }]);
        
        // Update UI
        renderBidHistory(id, card, user);
        inputEl.value = "";
        alert("✅ Bid placed successfully!");
    };

    return card;
}

// 🎨 Render auction items to the page
export function renderItems(items, currentUser) {
    const container = document.getElementById("items-container");
    container.innerHTML = ""; // Clear old items
  
    items.forEach(item => {
        renderItem(container, item, currentUser)
    });
}
