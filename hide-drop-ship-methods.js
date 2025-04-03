const server_base_url = 'https://check-cart-for-dropship-vendor-ae5cb0c428bb.herokuapp.com'; // Replace with your server URL
  
  // List of drop-ship vendors

  //test
  
  /**
   * Check if any items in the order_object are drop-ship items
   * Uses our server endpoint to fetch vendor details.
   * @returns {Promise<boolean>} True if order_object contains drop-ship items
   */
  async function checkForDropShipItems() {
    if (!order_object || !order_object.line_items) {
        return false;
    }

    try {
        const response = await fetch(`${server_base_url}/api/check-order-dropship`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order_object)
        });

        if (!response.ok) {
            console.error('Error checking drop ship items for order');
            return false;
        }

        const result = await response.json();
        return result.orderContainsDropshipVendors;
    } catch (error) {
        console.error('Error checking drop ship items for order', error);
        return false;
    }
  }
  
  /**
   * Hide specific shipping options if the cart contains drop-ship items.
   */
  async function hideShippingOptionsForDropShipItems() {
    const dropShipMethod = 'UPS Ground';
    const hasDropShipItems = await checkForDropShipItems();
    
    if (hasDropShipItems) {
      const shippingOptions = document.querySelectorAll('.form-check-label');
      shippingOptions.forEach(option => {
        const optionText = option.innerHTML.trim();
        if (!optionText.includes(dropShipMethod)) {
          const container = option.closest('.form-check') || option.parentElement;
          if (container) {
            container.style.display = 'none';
          }
        }
      });
    }
  }
  
  // Run when the shipping options form is loaded.
  document.addEventListener('DOMContentLoaded', () => {
    hideShippingOptionsForDropShipItems();
  });
