// Vendors for drop-ship items.
const dropShipVendors = [
    'Cawley',
    'Visions',
    'Moslow',
    'Larlu',
    'LarLu',
    'Edwards Garment',
    'Cannon Hill',
    'Power Sales',
    'Winning Edge'
];

// Check if order_object contains drop-ship items.
function checkForDropShipItems() {
    try {
        if (!order_object || !order_object.line_items) {
            console.warn('Order object or its line_items not defined.');
            return false;
        }
        const hasDropShipItems = order_object.line_items.some(item =>
            Array.isArray(item.vendors) && 
            item.vendors.some(vendor => dropShipVendors.includes(vendor.name))
        );
        console.info(hasDropShipItems ? 'Drop-ship items detected.' : 'No drop-ship items detected.');
        return hasDropShipItems;
    } catch (error) {
        console.error('Error checking drop-ship items:', error);
        return false;
    }
}

// Get vendor names from drop-ship items.
function getDropShipVendors() {
    try {
        if (!order_object || !order_object.line_items) {
            console.warn('Order object or its line_items not defined.');
            return [];
        }
        const vendorNames = order_object.line_items
            .filter(item => Array.isArray(item.vendors))
            .flatMap(item => item.vendors.map(vendor => vendor.name))
            .filter(name => dropShipVendors.includes(name));
        console.info('Drop-ship vendor names:', vendorNames);
        return vendorNames;
    } catch (error) {
        console.error('Error retrieving drop-ship vendors:', error);
        return [];
    }
}

// Get product names from items that have a drop-ship vendor.
function getDropShipProductNames() {
    try {
        if (!order_object || !order_object.line_items) {
            console.warn('Order object or its line_items not defined.');
            return [];
        }
        const productNames = [];
        order_object.line_items.forEach(item => {
            if (Array.isArray(item.vendors) && 
                item.vendors.some(vendor => dropShipVendors.includes(vendor.name))) {
                    productNames.push(item.product.name);
            }
        });
        console.info('Drop-ship product names:', productNames);
        return productNames;
    } catch (error) {
        console.error('Error retrieving drop-ship product names:', error);
        return [];
    }
}

// Hide non-UPS Ground shipping options when drop-ship items are present.
async function hideShippingOptionsForDropShipItems() {
    if (!checkForDropShipItems()) {
        console.info('No drop-ship items. Shipping options unchanged.');
        return;
    }

    // Show only these two shipping options:
    // - Inputs with id starting with "custom-rate_"
    // - Input with id "ups_UPSGround"
    const allowedInputPrefixes = ['custom-rate_'];
    const allowedExactIds = ['ups_UPSGround'];

    const shippingOptionContainers = document.querySelectorAll('.form-check');
    if (!shippingOptionContainers.length) {
        console.warn('No shipping options found.');
        return;
    }

    shippingOptionContainers.forEach(container => {
        const input = container.querySelector('input.form-check-input');
        if (input) {
            const id = input.id;
            const isAllowed = allowedInputPrefixes.some(prefix => id.startsWith(prefix)) ||
                              allowedExactIds.includes(id);
            container.style.display = isAllowed ? '' : 'none';
            console.info(isAllowed ? 'Showing option with id:' : 'Hiding option with id:', id);
        } else {
            container.style.display = 'none';
        }
    });
    
    // Get drop-ship product names and pass them into the alert.
    const dropShipProducts = getDropShipProductNames();
    const productList = dropShipProducts.length ? dropShipProducts.join(', ') : 'your items';
    alert(`Expedited shipping is unavailable for the following products: ${productList}`);
}

// Run when the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.info('DOM loaded. Checking shipping options...');
        hideShippingOptionsForDropShipItems();
    } catch (error) {
        console.error('Error on DOMContentLoaded:', error);
    }
});


