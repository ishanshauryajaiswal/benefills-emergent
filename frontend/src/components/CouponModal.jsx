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
    <div className="rounded-2xl border border-purple-100/50 bg-purple-50/40 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-7 w-28 rounded-full bg-purple-100" />
        <div className="h-5 w-16 rounded-full bg-purple-100" />
      </div>
      <div className="h-4 w-3/4 rounded-full bg-purple-100 mb-2" />
      <div className="h-3 w-1/2 rounded-full bg-purple-100" />
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

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden rounded-[24px] shadow-2xl p-0 bg-gradient-to-b from-purple-50/80 via-white to-white border-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-5 relative">
          <DialogTitle className="text-2xl font-extrabold flex items-center gap-2 text-gray-900">
            <Sparkles className="h-6 w-6 text-theme-primary" />
            Available Coupons
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1.5 font-medium">
            Select a coupon to apply to your order
          </DialogDescription>
          {/* Gradient Divider */}
          <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#3b825f]/20 to-transparent" />
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
            <div className="text-center py-16 text-gray-400">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-theme-primary/30" />
              <p className="font-semibold text-gray-600 text-lg">No coupons available right now</p>
              <p className="text-sm mt-1.5 text-gray-500">Check back later for great deals!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const eligible = isEligible(coupon);

                return (
                  <div
                    key={coupon.id}
                    className={`
                      relative rounded-2xl bg-white p-5 transition-all duration-300 border
                      ${eligible
                        ? 'border-gray-100 border-t-2 border-t-theme-primary shadow-sm hover:shadow-[0_8px_30px_rgba(59,130,95,0.08)] hover:-translate-y-1'
                        : 'border-gray-100 bg-gray-50/80 opacity-80'
                      }
                    `}
                  >
                    {/* Top row: code + discount + buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Code & Discount badges */}
                        <div className="flex items-center flex-wrap gap-2.5 mb-2.5">
                          <span
                            className={`
                              inline-flex items-center font-mono text-sm tracking-widest font-black uppercase
                              border rounded-full px-3.5 py-1
                              ${eligible
                                ? 'border-theme-primary/20 bg-theme-primary-overlay text-theme-primary'
                                : 'border-gray-200 bg-gray-100/50 text-gray-400'
                              }
                            `}
                          >
                            {coupon.code}
                          </span>
                          <span
                            className={`
                              inline-flex items-center text-xs font-bold px-3 py-1 rounded-full shadow-sm
                              ${eligible
                                ? 'bg-theme-primary text-white'
                                : 'bg-gray-200 text-gray-500 shadow-none'
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
                            rounded-full px-3.5 h-8 text-xs font-semibold transition-all duration-300
                            ${eligible
                              ? 'border-theme-primary/30 text-theme-primary hover:bg-theme-primary-overlay hover:border-theme-primary/50'
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
                            rounded-full px-5 h-8 text-xs font-semibold transition-all duration-300
                            ${eligible
                              ? 'bg-theme-primary hover:bg-theme-primary-hover text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                              : 'bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed shadow-none'
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
        <div className="px-6 pb-6 pt-2">
          <div className="bg-purple-50/60 border border-purple-100/60 rounded-xl p-3 text-center text-xs text-purple-900/60 flex items-center justify-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-theme-primary/60" />
            <span>Coupons are automatically applied based on your order value</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponModal;
