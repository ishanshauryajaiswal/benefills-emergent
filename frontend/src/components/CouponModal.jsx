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
import { Ticket, Copy, Check, Info, Sparkles } from 'lucide-react';
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

  /* ── Skeleton placeholder while loading ── */
  const SkeletonCard = () => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-7 w-28 rounded-md bg-gray-200" />
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
      <div className="h-3 w-1/2 rounded bg-gray-200" />
    </div>
  );

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

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl p-0 bg-gradient-to-b from-white to-green-50/30">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#3b825f]" />
            Available Coupons
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 mt-1">
            Select a coupon to apply to your order
          </DialogDescription>
        </DialogHeader>

        {/* ── Scrollable coupon list ── */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Ticket className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No coupons available</p>
              <p className="text-sm mt-1">Check back later for great deals!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const eligible = isEligible(coupon);

                return (
                  <div
                    key={coupon.id}
                    className={`
                      relative rounded-xl border bg-white p-4 transition-all duration-200
                      ${eligible
                        ? 'border-l-4 border-l-[#3b825f] border-t-gray-100 border-r-gray-100 border-b-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                        : 'border-l-4 border-l-gray-300 border-t-gray-100 border-r-gray-100 border-b-gray-100 bg-gray-50/80'
                      }
                    `}
                  >
                    {/* Top row: code + discount + buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Code & Discount badges */}
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span
                            className={`
                              inline-flex items-center font-mono text-sm tracking-wider font-bold uppercase
                              border-2 border-dashed rounded-md px-3 py-1
                              ${eligible
                                ? 'border-[#3b825f] bg-green-50 text-[#3b825f]'
                                : 'border-gray-300 bg-gray-100 text-gray-400'
                              }
                            `}
                          >
                            {coupon.code}
                          </span>
                          <span
                            className={`
                              inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm
                              ${eligible
                                ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white'
                                : 'bg-gray-300 text-gray-500'
                              }
                            `}
                          >
                            {getDiscountText(coupon)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className={`text-sm mb-1 ${eligible ? 'text-gray-700' : 'text-gray-400'}`}>
                          {coupon.description}
                        </p>

                        {/* Fine print */}
                        <div className={`flex flex-wrap gap-x-3 gap-y-0.5 text-xs ${eligible ? 'text-gray-400' : 'text-gray-300'}`}>
                          {coupon.minOrderAmount > 0 && (
                            <span>Min. order: ₹{coupon.minOrderAmount}</span>
                          )}
                          {coupon.maxDiscountAmount && (
                            <span>Max. discount: ₹{coupon.maxDiscountAmount}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons — horizontal pills */}
                      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(coupon.code)}
                          disabled={!eligible}
                          className={`
                            rounded-full px-3 h-8 text-xs font-medium transition-all duration-200
                            ${eligible
                              ? 'border-[#3b825f]/30 text-[#3b825f] hover:bg-green-50'
                              : 'opacity-40 cursor-not-allowed'
                            }
                          `}
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          disabled={!eligible}
                          className={`
                            rounded-full px-5 h-8 text-xs font-medium transition-all duration-200
                            ${eligible
                              ? 'bg-[#3b825f] hover:bg-[#2d6848] text-white shadow-sm hover:shadow-md'
                              : 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed'
                            }
                          `}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>

                    {/* Ineligible banner */}
                    {!eligible && (
                      <div className="mt-3 flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                        <Info className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Add <strong>₹{(coupon.minOrderAmount - orderAmount).toFixed(0)}</strong> more to unlock this coupon</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-5 pt-2">
          <div className="bg-green-50/60 border border-green-100 rounded-lg p-3 text-center text-xs text-green-700 flex items-center justify-center gap-1.5">
            <span>💡</span>
            <span>Coupons are automatically applied based on your order value</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponModal;
