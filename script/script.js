import { renderItem } from './render.js';
import { supabase } from './supabaseClient.js';

let currentPage = 1;
const itemsPerPage = 8;
let allItems = [];
let bidItems = [];
let user = [];
let oldPrices = {};
window.oldPrices = oldPrices;

async function fetchItems() {
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error.message);
    return;
  }

  const { data: { supabase_user } } = await supabase.auth.getUser();

  allItems = items;
  bidItems = await getBids()
  user = supabase_user

  // 🌟 Push "sold" items (items with a matching bid) to the end
  allItems.sort((a, b) => {
    const aIsSold = bidItems.includes(a.id);
    const bIsSold = bidItems.includes(b.id);

    if (aIsSold === bIsSold) {
      return 0; // Keep original order between same status
    }
    return aIsSold ? 1 : -1; // Sold items after unsold
  });

  renderPage();
}

async function fetchOldPrices() {
    const { data: prices, error } = await supabase
        .from("price_history")
        .select("item_id, old_price, changed_at");

    if (error) {
        console.error("Error fetching old prices:", error);
        alert("❌ Something went wrong fetching prices.");
        return;
    }

    console.log("Fetched Price History Data:", prices);

    // Find latest old_price for each item
    const latestPrices = {};

    prices.forEach(price => {
        const existing = latestPrices[price.item_id];
        if (!existing || new Date(price.changed_at) > new Date(existing.changed_at)) {
            latestPrices[price.item_id] = price;
        }
    });

    // Now map it into the global oldPrices object
    for (const [itemId, priceInfo] of Object.entries(latestPrices)) {
        window.oldPrices[itemId] = priceInfo.old_price;
    }

    console.log("Loaded Old Prices: ", window.oldPrices);
}

async function getBids() {
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

    return bid_item_ids
}

function renderPage() {
    const container = document.getElementById('items-container');
    const paginationInfo = document.getElementById('pagination-info');
    const paginationNumbers = document.getElementById('pagination-numbers');

    // Clear previous items
    container.innerHTML = '';
    if (paginationNumbers) {
        paginationNumbers.innerHTML = '';
        paginationNumbers.classList.remove('fade-in');
        void paginationNumbers.offsetWidth; // Trigger reflow for animation
        paginationNumbers.classList.add('fade-in');
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = allItems.slice(start, end);

    itemsToShow.forEach(item => {
        renderItem(container, item, user, bidItems);
    });

    // Button state
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (prevButton) {
        prevButton.disabled = currentPage === 1;
    }
    if (nextButton) {
        nextButton.disabled = end >= allItems.length;
    }

    // Hide or show buttons
    const totalPages = Math.ceil(allItems.length / itemsPerPage);

    if (prevButton) {
        prevButton.style.display = totalPages > 1 ? "inline-block" : "none";
    }
    if (nextButton) {
        nextButton.style.display = totalPages > 1 ? "inline-block" : "none";
    }

    // ✨ Update pagination info
    if (paginationInfo) {
        if (totalPages > 1) {
            paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (Total items: ${allItems.length})`;
        } else {
            paginationInfo.textContent = '';
        }
    }

    // ✨ Create page number buttons smartly
    if (paginationNumbers && totalPages > 1) {
        const maxVisible = 5; // show at most 5 numbers at a time

        const createPageButton = (i) => {
            const pageLink = document.createElement('button');
            pageLink.textContent = i;
            pageLink.className = `page-button ${i === currentPage ? 'active' : ''}`;
            pageLink.addEventListener('click', () => {
                currentPage = i;
                renderPage();
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll up
            });
            paginationNumbers.appendChild(pageLink);
        };

        const createEllipsis = () => {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'ellipsis';
            paginationNumbers.appendChild(dots);
        };

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                createPageButton(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) {
                    createPageButton(i);
                }
                createEllipsis();
                createPageButton(totalPages);
            } else if (currentPage >= totalPages - 2) {
                createPageButton(1);
                createEllipsis();
                for (let i = totalPages - 2; i <= totalPages; i++) {
                    createPageButton(i);
                }
            } else {
                createPageButton(1);
                createEllipsis();
                createPageButton(currentPage - 1);
                createPageButton(currentPage);
                createPageButton(currentPage + 1);
                createEllipsis();
                createPageButton(totalPages);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            console.log("User not logged in.");
        }
    });    

    // Expose supabase + placeBid globally if needed
    window.supabase = supabase;

    const logoutLink = document.getElementById("logout-link");
    const prevLink = document.getElementById('prev-page');
    const nextLink = document.getElementById('next-page');
    
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
    
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            signOut();
        });
    }

    // Pagination button listeners
    if (prevLink) {
        prevLink.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage();
            }
        });
    }
    
    if (nextLink) {
        nextLink.addEventListener('click', () => {
            if (currentPage * itemsPerPage < allItems.length) {
                currentPage++;
                renderPage();
            }
        });
    }

    updateAuthStatus();

    // Remove the hash fragment after login
    window.history.replaceState({}, document.title, window.location.pathname);

    // Load items on page load
    await fetchOldPrices();
    fetchItems();
});
