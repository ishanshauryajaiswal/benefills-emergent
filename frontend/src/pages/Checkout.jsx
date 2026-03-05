import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from '../hooks/use-toast';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import CouponModal from '../components/CouponModal';
import useRazorpay from '../hooks/useRazorpay';
import useGooglePlaces from '../hooks/useGooglePlaces';
import { trackInitiateCheckout, trackPurchase } from '../utils/metaPixel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiatePayment, loading: razorpayLoading } = useRazorpay();
  const { scriptLoaded, attachAutocomplete, lookupPincode } = useGooglePlaces();
  const addressInputRef = useRef(null);
  const [pincodeLooking, setPincodeLooking] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    couponCode: ''
  });

  const [discount, setDiscount] = useState(0);
  const deliveryCharge = 0;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryCharge - discount;

  // Track InitiateCheckout when component mounts
  useEffect(() => {
    if (cartItems.length > 0) {
      trackInitiateCheckout({
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
        })),
        total: total,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach Google Places Autocomplete to the address input
  useEffect(() => {
    if (scriptLoaded && addressInputRef.current) {
      attachAutocomplete(addressInputRef.current, (placeData) => {
        setFormData((prev) => ({
          ...prev,
          address: placeData.address || prev.address,
          city: placeData.city || prev.city,
          state: placeData.state || prev.state,
          pincode: placeData.pincode || prev.pincode,
        }));

        toast({
          title: 'Address auto-filled!',
          description: 'City, state and pincode have been filled from your selection.',
        });
      });
    }
  }, [scriptLoaded, attachAutocomplete]);

  // PIN code → City/State lookup
  const handlePincodeChange = useCallback(
    async (pincode) => {
      if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
        setPincodeLooking(true);
        const result = await lookupPincode(pincode);
        if (result) {
          setFormData((prev) => ({
            ...prev,
            city: result.city || prev.city,
            state: result.state || prev.state,
          }));
          toast({
            title: 'Location found!',
            description: `${result.city}, ${result.state}`,
          });
        }
        setPincodeLooking(false);
      }
    },
    [lookupPincode]
  );

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Trigger pincode lookup when user types 6 digits
    if (id === 'pincode') {
      handlePincodeChange(value);
    }
  };

  const applyCoupon = async () => {
    if (!formData.couponCode) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/coupons/validate`, {
        code: formData.couponCode,
        orderAmount: subtotal
      });

      if (response.data.valid) {
        setDiscount(response.data.discountAmount);
        toast({
          title: 'Success!',
          description: response.data.message,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: response.data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to validate coupon',
        variant: 'destructive'
      });
    }
  };

  const handleCouponSelect = async (code) => {
    // Set the coupon code first
    setFormData(prev => ({
      ...prev,
      couponCode: code
    }));

    // Apply coupon directly with the code (avoid stale state issue)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/coupons/validate`, {
        code: code,
        orderAmount: subtotal
      });

      if (response.data.valid) {
        setDiscount(response.data.discountAmount);
        toast({
          title: 'Success!',
          description: response.data.message,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: response.data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to validate coupon',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        discount,
        deliveryCharge,
        total,
        couponCode: formData.couponCode,
        userId: user?.id || null,
      };

      // Initiate Razorpay payment
      await initiatePayment(
        {
          amount: total,
          receipt: `order_${Date.now()}`,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          description: 'Benefills Order',
          notes: {
            orderId: `ORD${Date.now()}`,
          },
        },
        async (paymentResponse) => {
          // Payment successful - create order in backend
          try {
            const response = await ordersAPI.create({
              ...orderData,
              paymentId: paymentResponse.razorpay_payment_id,
              paymentStatus: 'paid',
            });

            // Track Purchase event in Meta Pixel
            trackPurchase({
              items: cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
              })),
              total: total,
            });

            toast({
              title: 'Order placed successfully!',
              description: `Order ID: ${response.data.id}`,
            });

            clearCart();
            navigate(`/order-success/${response.data.id}`);
          } catch (error) {
            toast({
              title: 'Order creation failed',
              description: 'Payment successful but order creation failed. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        (error) => {
          // Payment failed
          toast({
            title: 'Payment failed',
            description: error.message || 'Something went wrong',
            variant: 'destructive',
          });
        }
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white flex items-center justify-center">
        <Card className="max-w-md w-full rounded-2xl shadow-sm border border-gray-100">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button
              onClick={() => navigate('/shop')}
              className="bg-theme-primary hover:bg-theme-primary-hover"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:text-theme-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-theme-primary">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-theme-primary" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address *
                    </Label>
                    <Input
                      id="address"
                      ref={addressInputRef}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Start typing your address..."
                      autoComplete="street-address"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="flex items-center gap-1.5">
                        Pincode *
                        {pincodeLooking && (
                          <Loader2 className="h-3 w-3 animate-spin text-theme-primary" />
                        )}
                      </Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        autoComplete="postal-code"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={handleChange}
                        autoComplete="address-level1"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-theme-primary hover:bg-theme-primary-hover py-6 text-lg mt-6"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Pay ₹${total}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                        width={64}
                        height={64}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-theme-primary">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon - Reserved space for CLS prevention */}
                <div className="space-y-2 min-h-[100px]">
                  <Label htmlFor="couponCode">Have a coupon?</Label>
                  <div className="min-h-[24px]">
                    <CouponModal onApplyCoupon={handleCouponSelect} orderAmount={subtotal} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="couponCode"
                      value={formData.couponCode}
                      onChange={handleChange}
                      placeholder="Enter code"
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      onClick={applyCoupon}
                      variant="outline"
                      className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                      {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-theme-primary">₹{total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
