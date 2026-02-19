import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Ticket, Copy, Check } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CouponModal = ({ onApplyCoupon, orderAmount = 0 }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCoupons();
    }
  }, [open]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/coupons/`);
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: 'Copied!',
      description: `Coupon code "${code}" copied to clipboard`,
    });
  };

  const handleApplyCoupon = (code) => {
    onApplyCoupon(code);
    setOpen(false);
  };

  const isEligible = (coupon) => {
    return orderAmount >= coupon.minOrderAmount;
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="link" 
          className="text-theme-primary hover:text-theme-primary-hover p-0 h-auto font-medium"
        >
          <Ticket className="h-4 w-4 mr-1" />
          View Available Coupons
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Available Coupons</DialogTitle>
          <DialogDescription>
            Select a coupon to apply to your order
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No coupons available at the moment
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {coupons.map((coupon) => {
              const eligible = isEligible(coupon);
              
              return (
                <div
                  key={coupon.id}
                  className={`border-2 rounded-lg p-4 ${
                    eligible 
                      ? 'border-theme-primary bg-green-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  } transition-all`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={`font-mono text-lg px-3 py-1 ${
                            eligible 
                              ? 'bg-theme-primary hover:bg-theme-primary' 
                              : 'bg-gray-400'
                          }`}
                        >
                          {coupon.code}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {getDiscountText(coupon)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{coupon.description}</p>
                      {coupon.minOrderAmount > 0 && (
                        <p className="text-xs text-gray-500">
                          Minimum order: ₹{coupon.minOrderAmount}
                        </p>
                      )}
                      {coupon.maxDiscountAmount && (
                        <p className="text-xs text-gray-500">
                          Maximum discount: ₹{coupon.maxDiscountAmount}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(coupon.code)}
                        disabled={!eligible}
                        className="min-w-[80px]"
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={!eligible}
                        className="min-w-[80px] bg-theme-primary hover:bg-theme-primary-hover"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  {!eligible && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Add ₹{(coupon.minOrderAmount - orderAmount).toFixed(0)} more to use this coupon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 text-center border-t pt-4">
          💡 Coupons are automatically applied based on your order value
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponModal;
