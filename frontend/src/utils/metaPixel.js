// Meta Pixel Configuration
export const FB_PIXEL_ID = '1335832275226509';

// Initialize Meta Pixel
export const initMetaPixel = () => {
  if (typeof window !== 'undefined' && !window.fbq) {
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    window.fbq('init', FB_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
};

// Track Page View
export const trackPageView = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Track Add to Cart
export const trackAddToCart = (product) => {
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'INR',
    });
  }
};

// Track Purchase
export const trackPurchase = (orderData) => {
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: orderData.total,
      currency: 'INR',
      contents: orderData.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.price,
      })),
      content_type: 'product',
      num_items: orderData.items.length,
    });
  }
};

// Track Initiate Checkout
export const trackInitiateCheckout = (cartData) => {
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: cartData.total,
      currency: 'INR',
      contents: cartData.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      content_type: 'product',
      num_items: cartData.items.length,
    });
  }
};

// Track View Content (Product Page)
export const trackViewContent = (product) => {
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'INR',
    });
  }
};

// Track Search
export const trackSearch = (searchQuery) => {
  if (window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchQuery,
    });
  }
};
