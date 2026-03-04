import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { CheckCircle2, Package, MapPin, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.getById(orderId);
                setOrder(response.data);
            } catch (err) {
                setError('We could not find your order. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        } else {
            setError('No order ID provided.');
            setLoading(false);
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                        <p className="text-gray-600">{error || 'Order not found.'}</p>
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

    const { customerInfo, items, subtotal, discount, deliveryCharge, total } = order;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* ── Success Banner ── */}
                <Card className="text-center overflow-hidden">
                    <CardContent className="pt-10 pb-10">
                        <div className="flex justify-center mb-5">
                            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-theme-primary-overlay">
                                <CheckCircle2 className="w-10 h-10 text-theme-primary" strokeWidth={1.5} />
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed!</h1>
                        <p className="text-gray-500 text-sm mb-4">
                            Thank you for your purchase. We'll send a confirmation to{' '}
                            <span className="font-medium text-gray-700">{customerInfo.email}</span>.
                        </p>
                        <p className="text-xs text-gray-400 font-mono tracking-wide">
                            Order ID: {order.id}
                        </p>
                    </CardContent>
                </Card>

                {/* ── Order Items ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Package className="w-4 h-4 text-theme-primary" />
                            Items Ordered
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="flex gap-4 items-start">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                    loading="lazy"
                                    width={64}
                                    height={64}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                                    <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                    ₹{item.price * item.quantity}
                                </p>
                            </div>
                        ))}

                        <Separator />

                        {/* Price Breakdown */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>−₹{discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                                    {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total Paid</span>
                                <span className="text-theme-primary">₹{total}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Shipping Address ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <MapPin className="w-4 h-4 text-theme-primary" />
                            Shipping To
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-gray-900">{customerInfo.name}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{customerInfo.address}</p>
                        <p className="text-sm text-gray-600">
                            {customerInfo.city}, {customerInfo.state} – {customerInfo.pincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">{customerInfo.phone}</p>
                    </CardContent>
                </Card>

                {/* ── CTA ── */}
                <div className="flex flex-col sm:flex-row gap-3 pb-4">
                    <Button
                        className="flex-1 bg-theme-primary hover:bg-theme-primary-hover gap-2"
                        onClick={() => navigate('/shop')}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Continue Shopping
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
