console.log("Auction site loaded!");
const items = [
{
    id: 1,
    title: "2x Meluka Bedside Tables",
    image: "images/bedside.jpeg",
    currentBid: 250
},
{
    id: 2,
    title: "Chesty Boy 2 Bay x 4 Drawer Chest of Drawers",
    image: "images/chestofdrawers.jpeg",
    currentBid: 1000
},
{
    id: 3,
    title: "2x Grotime Rollover Beds (cot to single/toddler/day bed)",
    image: "images/grotimebed.jpeg",
    currentBid: 500
}
];

const container = document.getElementById("items-container");

items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>Current Bid: $${item.currentBid}</p>
        <button class="bid-btn" onclick="placeBid(${item.id})">Place Bid</button>
    `;
    container.appendChild(card);
});

function placeBid(id) {
    alert(`You placed a bid on item #${id}!`);
}