import { useState, useEffect } from 'react';
import axios from 'axios';

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
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection and try again.');
      }

      // Create Razorpay order via backend (using axios to avoid fetch body-stream issues with PostHog)
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      let data;
      try {
        const response = await axios.post(`${backendUrl}/api/payments/create-order`, {
          amount: Math.round(orderData.amount * 100), // Convert to paise
          currency: 'INR',
          receipt: orderData.receipt || `receipt_${Date.now()}`,
          notes: orderData.notes || {},
        });
        data = response.data;
      } catch (apiError) {
        console.error('Create order API error:', apiError);
        const errorMsg = apiError?.response?.data?.detail || apiError.message || 'Failed to create payment order';
        throw new Error(`Payment order creation failed: ${errorMsg}`);
      }

      if (!data || !data.success) {
        throw new Error('Failed to create payment order. Please try again.');
      }

      // Use key from backend response, fallback to env var
      const razorpayKeyId = data.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID;
      
      if (!razorpayKeyId) {
        throw new Error('Razorpay configuration error. Please contact support.');
      }

      // Initialize Razorpay payment
      const options = {
        key: razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Benefills',
        description: orderData.description || 'Purchase from Benefills',
        order_id: data.order_id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const { data: verifyData } = await axios.post(
              `${backendUrl}/api/payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

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
            console.error('Payment verification error:', error);
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
      
      razorpay.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        if (onFailure) {
          onFailure(new Error(response.error.description || 'Payment failed'));
        }
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      if (onFailure) onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};

export default useRazorpay;
