console.log("Auction site loaded!");
const items = [
{
    id: 1,
    title: "2x Meluka Bedside Tables",
    image: "https://drive.usercontent.google.com/download?id=1J-l9GiFHcZdSjiXXvUCK0ksbdFq4aFDZ",
    currentBid: 250
},
{
    id: 2,
    title: "Chesty Boy 2 Bay x 4 Drawer Chest of Drawers",
    image: "https://drive.usercontent.google.com/download?id=1uRj1eroNQ6S4eGf3q9iGtyVo3tgiJUjX",
    currentBid: 90
},
{
    id: 3,
    title: "2x Grotime Rollover Beds (cot to single/toddler/day bed)",
    image: "https://drive.usercontent.google.com/download?id=14LTul4f4Py-qkspMKvs6q7PngeBaFZ2e",
    currentBid: 120
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