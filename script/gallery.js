// gallery.js

export const itemGalleryIndex = {};
export const itemGalleryImages = {};

export function nextImage(itemId) {
    const images = itemGalleryImages[itemId];
    if (!images || images.length === 0) return;

    itemGalleryIndex[itemId] = (itemGalleryIndex[itemId] + 1) % images.length;
    updateGalleryImage(itemId);
}

export function prevImage(itemId) {
    const images = itemGalleryImages[itemId];
    if (!images || images.length === 0) return;

    itemGalleryIndex[itemId] =
        (itemGalleryIndex[itemId] - 1 + images.length) % images.length;
    updateGalleryImage(itemId);
}

export function setImageIfExists(imageElement, url) {
    const testImg = new Image();
    testImg.onload = function () {
        // Image exists
        imageElement.src = url;
    };
    testImg.onerror = function () {
        // Image does not exist
        console.warn("Image not; found:", url)
        imageElement.src = "../images/placeholder.png";
    };
    testImg.src = url;
}

export function updateGalleryImage(itemId) {
    const imgEl = document.getElementById(`img-${itemId}`);
    const images = itemGalleryImages[itemId];
    const index = itemGalleryIndex[itemId];
    if (imgEl && images && images[index]) {    
        setImageIfExists(imgEl, images[index]);
    }
}