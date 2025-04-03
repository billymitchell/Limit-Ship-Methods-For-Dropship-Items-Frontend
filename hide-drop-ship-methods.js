// Base URL for the back-end server that checks for drop-ship items.
// Make sure to replace this with your production server URL if necessary.
const server_base_url = 'https://check-cart-for-dropship-vendor-ae5cb0c428bb.herokuapp.com';

// The order_object is expected to be globally available with the current order's details.
// It should contain a property "line_items" to process drop-ship items.
  
/**
 * Check if any items in the order_object are drop-ship items.
 * Uses our server endpoint to fetch vendor details with a GET request.
 * Logs each step for debugging purposes.
 * 
 * @returns {Promise<boolean>} True if order_object contains drop-ship items, otherwise false.
 */
async function checkForDropShipItems() {
    // Validate that the order_object and its line_items exist.
    if (!order_object || !order_object.line_items) {
        console.warn('Order object or order_object.line_items is not defined.');
        return false;
    }

    try {
        console.info('Sending order data to check for drop-ship items using POST request...');
        // Send the order_object as JSON in the POST body
        const response = await fetch(`${server_base_url}/api/check-order-dropship`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order: order_object })
        });

        // Check if the response is not okay.
        if (!response.ok) {
            console.error('Error checking drop ship items for order. Server responded with status:', response.status);
            return false;
        }

        // Safely parse the JSON response.
        const result = await response.json();
        console.info('Received response from drop-ship check:', result);
        
        // Return the boolean flag based on vendor check result.
        return !!result.orderContainsDropshipVendors;
    } catch (error) {
        // Log detailed error information for debugging.
        console.error('Exception occurred while checking drop ship items for order:', error);
        return false;
    }
}

/**
 * Hide specific shipping options if the cart contains drop-ship items.
 * Logs key steps and warns if expected elements are not found.
 */
async function hideShippingOptionsForDropShipItems() {
    const dropShipMethod = 'UPS Ground'; // The shipping option to keep visible.
    
    console.info('Checking for drop-ship items in the order...');
    const hasDropShipItems = await checkForDropShipItems();
    
    if (hasDropShipItems) {
        console.info('Drop-ship items detected. Hiding non-matching shipping options...');
        // Grab all shipping option label elements from the DOM.
        const shippingOptions = document.querySelectorAll('.form-check-label');
        
        if (!shippingOptions || shippingOptions.length === 0) {
            console.warn('No shipping options found on the page.');
            return;
        }

        // Iterate through each option and toggle display based on matching text.
        shippingOptions.forEach(option => {
            const optionText = option.innerHTML.trim();
            // Show only the option that includes our specified dropShipMethod.
            if (!optionText.includes(dropShipMethod)) {
                // Locate the container of the shipping option label.
                const container = option.closest('.form-check') || option.parentElement;
                if (container) {
                    container.style.display = 'none';
                    console.info('Hiding shipping option:', optionText);
                } else {
                    console.warn('Unable to find container for shipping option:', optionText);
                }
            } else {
                console.info('Keeping shipping option visible:', optionText);
            }
        });
    } else {
        console.info('No drop-ship items detected. Shipping options remain unchanged.');
    }
}

// Run the shipping option filtering once the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    console.info('DOM fully loaded. Initiating shipping options check...');
    hideShippingOptionsForDropShipItems();
});
