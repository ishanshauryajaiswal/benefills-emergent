import { useState, useEffect } from 'react';

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      let script = document.getElementById('razorpay-script');
      if (script) {
        script.addEventListener('load', () => resolve(true));
        script.addEventListener('error', () => resolve(false));
        return;
      }

      script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const initiatePayment = async (orderData, onSuccess, onFailure) => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create Razorpay order via backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(orderData.amount * 100), // Convert to paise
          currency: 'INR',
          receipt: orderData.receipt || `receipt_${Date.now()}`,
          notes: orderData.notes || {},
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to create order');
      }

      // Initialize Razorpay payment
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Benefills',
        description: orderData.description || 'Purchase from Benefills',
        order_id: data.order_id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `${backendUrl}/api/payments/verify-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              if (onSuccess) {
                onSuccess({
                  ...response,
                  ...verifyData,
                });
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            if (onFailure) onFailure(error);
          }
        },
        prefill: {
          name: orderData.customerName || '',
          email: orderData.customerEmail || '',
          contact: orderData.customerPhone || '',
        },
        theme: {
          color: '#10B981',
        },
        modal: {
          ondismiss: function () {
            if (onFailure) onFailure(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      if (onFailure) onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};

export default useRazorpay;
