/**
 * Jewellery Management System
 * Modern ES6+ implementation for dynamic jewellery grid
 */

// Configuration constants
const JEWELLERY_CONFIG = {
  BASE_PATH: "images/",
  IMAGE_PREFIX: "jewel-",
  TOTAL_IMAGES: 36,
  INITIAL_LOAD: 8,
  BATCH_SIZE: 8,
  FALLBACK_IMAGES: [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1594576722512-582d5577dc56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1596944090625-7d7c2e6ab234?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  ],
};

// Jewellery items database (simplified - only names)
const JEWELLERY_NAMES = [
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
  "Jewellery",
];

/**
 * Jewellery Image Manager
 * Handles image loading and fallback logic
 */
class JewelleryImageManager {
  /**
   * Get image source URL
   * @param {number} index - Image index
   * @returns {string} Image URL
   */
  static getImageSrc(index) {
    // Try local image first
    const localPath = `${JEWELLERY_CONFIG.BASE_PATH}${JEWELLERY_CONFIG.IMAGE_PREFIX}${index}.jpg`;

    // In production, you'd check if the image exists
    // For now, we'll assume local images exist up to TOTAL_IMAGES
    if (index <= JEWELLERY_CONFIG.TOTAL_IMAGES) {
      return localPath;
    }

    // Fallback to Unsplash image
    return this.getFallbackImage(index);
  }

  /**
   * Get fallback image
   * @param {number} index - Image index for consistent fallback
   * @returns {string} Fallback image URL
   */
  static getFallbackImage(index) {
    const fallbackIndex = (index - 1) % JEWELLERY_CONFIG.FALLBACK_IMAGES.length;
    return JEWELLERY_CONFIG.FALLBACK_IMAGES[fallbackIndex];
  }

  /**
   * Preload image
   * @param {string} src - Image source
   * @returns {Promise<boolean>} Whether image loaded successfully
   */
  static async preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }
}

/**
 * Jewellery Item Class
 * Represents a single jewellery item
 */
class JewelleryItem {
  /**
   * Create a jewellery item
   * @param {number} id - Item ID
   */
  constructor(id) {
    this.id = id;
    this.name = this.getName();
    this.imageSrc = JewelleryImageManager.getImageSrc(id);
  }

  /**
   * Get jewellery name
   * @returns {string} Item name
   */
  getName() {
    return JEWELLERY_NAMES[this.id - 1] || `Jewellery Item ${this.id}`;
  }

  /**
   * Generate WhatsApp message
   * @returns {string} Encoded WhatsApp message
   */
  getWhatsAppMessage() {
    const message = `Hi Sisters Sparkles, I'm interested in buying ${this.name}. Please share details and price.`;
    return encodeURIComponent(message);
  }
}

/**
 * Jewellery Grid Manager
 * Handles dynamic grid rendering and interactions
 */
class JewelleryGridManager {
  /**
   * Initialize jewellery grid
   */
  constructor() {
    this.grid = document.getElementById("jewelleryGrid");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.viewMoreContainer = document.getElementById("viewMoreContainer");
    this.viewMoreBtn = document.getElementById("viewMoreBtn");
    this.loadedItems = new Set();
    this.isInitializing = false;

    this.init();
  }

  /**
   * Initialize grid
   */
  async init() {
    if (!this.grid) {
      console.error("Jewellery grid element not found");
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      this.setupEventListeners();
      await this.loadInitialItems();
      this.setupImageObservers();
    } catch (error) {
      console.error("Failed to initialize jewellery grid:", error);
      this.showErrorFallback();
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // View More button
    this.viewMoreBtn?.addEventListener("click", () => this.loadMoreItems());

    // WhatsApp button delegation
    this.grid.addEventListener("click", (e) => {
      const whatsappBtn = e.target.closest(".whatsapp-btn[data-item-id]");
      if (whatsappBtn) {
        this.handleWhatsAppClick(whatsappBtn);
      }
    });
  }

  /**
   * Setup image observers for lazy loading
   */
  setupImageObservers() {
    // Simple implementation - load all images immediately for now
    const images = this.grid.querySelectorAll("img[data-src]");
    images.forEach((img) => {
      const src = img.dataset.src;
      img.src = src;
      img.onload = () => {
        img.style.opacity = "1";
      };
      img.onerror = () => {
        const itemId = img.closest(".jewellery-card")?.dataset.itemId;
        if (itemId) {
          const fallbackSrc = JewelleryImageManager.getFallbackImage(
            parseInt(itemId)
          );
          img.src = fallbackSrc;
        }
      };
    });
  }

  /**
   * Load initial jewellery items
   */
  async loadInitialItems() {
    this.showLoading(true);

    const endIndex = Math.min(
      JEWELLERY_CONFIG.INITIAL_LOAD,
      JEWELLERY_CONFIG.TOTAL_IMAGES
    );
    const items = Array.from({ length: endIndex }, (_, i) => i + 1);

    // Load all initial items at once (no delay for better UX)
    await this.loadItemsBatch(items);

    this.showLoading(false);
    this.updateViewMoreButton();
  }

  /**
   * Load more jewellery items
   */
  async loadMoreItems() {
    if (this.viewMoreBtn.disabled) return;

    this.viewMoreBtn.disabled = true;
    this.viewMoreBtn.textContent = "Loading...";

    const startIndex = this.loadedItems.size + 1;
    const endIndex = Math.min(
      this.loadedItems.size + JEWELLERY_CONFIG.BATCH_SIZE,
      JEWELLERY_CONFIG.TOTAL_IMAGES
    );

    const newItems = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i
    );

    await this.loadItemsBatch(newItems);

    this.viewMoreBtn.disabled = false;
    this.viewMoreBtn.textContent = "View More Jewellery";
    this.updateViewMoreButton();
  }

  /**
   * Load a batch of jewellery items
   * @param {number[]} itemIds - Array of item IDs to load
   */
  async loadItemsBatch(itemIds) {
    const fragment = document.createDocumentFragment();

    for (const itemId of itemIds) {
      if (this.loadedItems.has(itemId)) continue;

      const jewellery = new JewelleryItem(itemId);
      const card = this.createJewelleryCard(jewellery);
      fragment.appendChild(card);

      this.loadedItems.add(itemId);
    }

    this.grid.appendChild(fragment);

    // Trigger animations after DOM update
    setTimeout(() => this.animateNewCards(), 50);

    // Setup image loading for new cards
    this.setupImageObservers();
  }

  /**
   * Create jewellery card element (SIMPLIFIED VERSION)
   * @param {JewelleryItem} jewellery - Jewellery item
   * @returns {HTMLElement} Card element
   */
  createJewelleryCard(jewellery) {
    const card = document.createElement("div");
    card.className =
      "jewellery-card bg-white rounded-xl overflow-hidden shadow-md reveal-scale";
    card.dataset.itemId = jewellery.id;

    card.innerHTML = `
            <div class="relative overflow-hidden h-72 group">
                <img
                    data-src="${jewellery.imageSrc}"
                    alt="${jewellery.name}"
                    class="card-image w-full h-full object-cover transition-opacity duration-300"
                    style="opacity: 0;"
                />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end"
                >
                    <div class="w-full p-4">
                        <button
                            class="whatsapp-btn w-full py-3 rounded-lg flex items-center justify-center space-x-2"
                            data-item-id="${jewellery.id}"
                            data-item-name="${jewellery.name}"
                            data-image-src="${jewellery.imageSrc}"
                             data-netlify-src="${jewellery.netlifyImageUrl}" 
                        >
                            <i class="fab fa-whatsapp"></i>
                            <span class="font-heading">Buy on WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

    return card;
  }

  /**
   * Animate newly added cards
   */
  animateNewCards() {
    const newCards = this.grid.querySelectorAll(".reveal-scale:not(.active)");
    newCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("active");
      }, index * 50);
    });
  }

  /**
   * Handle WhatsApp button click
   * @param {HTMLElement} button - Clicked button
   */
  handleWhatsAppClick(button) {
    const itemId = button.dataset.itemId;
    const itemName = button.dataset.itemName;
    const localImageSrc = button.dataset.imageSrc; // Local for display
    const netlifyImageUrl = `https://sister-sparkles.netlify.app/images/jewel-${itemId}.jpg`;

    // Use existing modal if available
    const buyNowModal = document.getElementById("buyNowModal");
    const modalItem = document.getElementById("modalItem");
    const modalImage = document.getElementById("modalImage");
    const modalWhatsappLink = document.getElementById("modalWhatsappLink");

    if (buyNowModal && modalItem && modalImage && modalWhatsappLink) {
      // Get jewellery name from the dataset or use default
      const displayName = itemName || `Jewellery Item ${itemId}`;

      // Show local image in modal
      modalItem.textContent = displayName;
      modalImage.src = localImageSrc; // LOCAL image in modal
      modalImage.alt = displayName;

      // Generate WhatsApp message WITH NETLIFY URL
      const message = `Hi Sisters Sparkles! \n\nI'm interested in buying this jewellery from your exhibition:\n\n *${displayName}*\n *Image:* ${netlifyImageUrl}\n *Item #${itemId}*\n\nPlease share price and availability. Thank you!`;

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/917436053004?text=${encodeURIComponent(
        message
      )}`;

      // Set the href for the modal WhatsApp button
      modalWhatsappLink.href = whatsappUrl;

      // Show modal
      buyNowModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  /**
   * Show/hide loading indicator
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show) {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.toggle("hidden", !show);
    }
  }

  /**
   * Update View More button visibility
   */
  updateViewMoreButton() {
    if (!this.viewMoreContainer) return;

    const hasMoreItems = this.loadedItems.size < JEWELLERY_CONFIG.TOTAL_IMAGES;
    this.viewMoreContainer.classList.toggle("hidden", !hasMoreItems);
  }

  /**
   * Show error fallback
   */
  showErrorFallback() {
    if (this.grid) {
      this.grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-gem text-4xl text-gray-300 mb-4"></i>
                    <h3 class="font-heading text-xl text-gray-700 mb-2">Unable to Load Jewellery</h3>
                    <p class="text-gray-600">Please check back soon or contact us directly.</p>
                </div>
            `;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.viewMoreBtn?.removeEventListener("click", () => this.loadMoreItems());
    this.grid?.removeEventListener("click", (e) => {
      const whatsappBtn = e.target.closest(".whatsapp-btn[data-item-id]");
      if (whatsappBtn) this.handleWhatsAppClick(whatsappBtn);
    });
  }
}

/**
 * Initialize Jewellery System
 */
class JewellerySystem {
  constructor() {
    this.gridManager = null;
  }

  async init() {
    try {
      // Initialize grid manager
      this.gridManager = new JewelleryGridManager();

      console.log("Jewellery system initialized successfully");
      console.log(`Total jewellery items: ${JEWELLERY_CONFIG.TOTAL_IMAGES}`);
    } catch (error) {
      console.error("Failed to initialize jewellery system:", error);
      this.showErrorFallback();
    }
  }

  showErrorFallback() {
    const grid = document.getElementById("jewelleryGrid");
    if (grid) {
      grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-gem text-4xl text-gray-300 mb-4"></i>
                    <h3 class="font-heading text-xl text-gray-700 mb-2">Unable to Load Jewellery</h3>
                    <p class="text-gray-600">Please check back soon or contact us directly.</p>
                </div>
            `;
    }
  }

  destroy() {
    this.gridManager?.destroy();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize jewellery system
  window.jewellerySystem = new JewellerySystem();
  window.jewellerySystem.init();

  // Add CSS for image transitions
  const style = document.createElement("style");
  style.textContent = `
        .card-image {
            transition: opacity 0.5s ease-in-out, transform 0.7s ease !important;
        }
        .reveal-scale {
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal-scale.active {
            opacity: 1;
            transform: scale(1);
        }
    `;
  document.head.appendChild(style);
});
