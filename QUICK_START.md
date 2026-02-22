# 🚀 Quick Start Guide - Benefills Admin & Shop

## 📍 Access Your Store

### Customer View (Shop)
**URL**: `https://shiprock-integration.preview.emergentagent.com/`

**Features**:
- Browse all products
- Add items to cart
- Complete guest checkout (no login required)
- Apply coupon code: `FIRSTLOVE20` for 20% off

### Admin Dashboard
**URL**: `https://shiprock-integration.preview.emergentagent.com/admin`

**Login Credentials**:
- **Email**: `admin@benefills.com`
- **Password**: `admin123`

**Admin Features**:
1. **Dashboard Overview**
   - Total products
   - Total orders
   - Total revenue
   - Pending orders count

2. **Product Management Tab**
   - View all 4 products
   - Click "Add Product" to create new products
   - Click Edit icon (pencil) to modify products
   - Click Delete icon (trash) to remove products
   - Update stock quantities

3. **Orders Management Tab**
   - View all customer orders
   - Update order status (pending → processing → shipped → delivered)
   - View customer information
   - Track order items and totals

## 🛒 Test the Store

### Customer Flow:
1. Go to homepage
2. Click "Shop" or scroll to products
3. Click "Add to bag" on any product
4. Click cart icon (top right)
5. Review items, click "Proceed to Checkout"
6. Fill in shipping information
7. Optional: Enter coupon `FIRSTLOVE20`
8. Click "Pay ₹{amount}" to place order

### Admin Flow:
1. Go to `/admin` 
2. Login with credentials above
3. **Add a New Product**:
   - Click "Add Product" button
   - Fill in:
     - Product Name
     - Description
     - Price & Original Price
     - Stock quantity
     - Image URL
     - Category (bars/nut-butter/combo)
     - Badge (optional: bestseller, most repurchased)
     - Ingredients (comma-separated)
   - Click "Create Product"

4. **Manage Orders**:
   - Switch to "Orders" tab
   - View customer orders
   - Change status using dropdown
   - Track revenue

## 🔧 Current Products (Already Seeded)

1. **Seeds Boost Bar - pack of 7**
   - Price: ₹410 (was ₹490)
   - Stock: 42 units
   - Badge: "most repurchased"

2. **Benefills Nut-ella Nut Butter**
   - Price: ₹650 (was ₹750)
   - Stock: 34 units
   - Badge: "bestseller"

3. **Thyrovibe nut butters - the duo pack**
   - Price: ₹1200 (was ₹1590)
   - Stock: 19 units

4. **Benefills Monthly Pack**
   - Price: ₹1900 (was ₹2200)
   - Stock: 15 units

## ⚠️ Important Notes

### Fixed Issue:
- ✅ API routing fixed with trailing slashes
- ✅ Products should now load in Shop page
- ✅ Frontend automatically reloaded

### If Shop is Still Empty:
1. **Hard refresh** your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache** and reload
3. **Check browser console** (F12) for any errors

### Security:
- ⚠️ **Change admin password** before going to production!
- ⚠️ Current password is for testing only

## 📊 Analytics Tracking

Your store now tracks:
- **Google Analytics**: G-GWST8MBK4P
- **Meta Pixel**: 1335832275226509

All page views and events are being tracked.

## 🔄 After Deployment

Once deployed, you'll need to:
1. Add **Razorpay** credentials for payments
2. Add **Shiprocket** credentials for shipping
3. Update admin password
4. Configure production CORS settings

## 🐛 Troubleshooting

### Products Not Loading?
```
Solution: Hard refresh browser (Ctrl+Shift+R)
```

### Can't Login to Admin?
```
URL: /admin (not /admin/)
Email: admin@benefills.com
Password: admin123
```

### Orders Not Appearing?
```
Check: Stock must be available for products
Test: Place a test order first
```

## 📞 Need Help?

Check these files:
- `/app/DEVELOPMENT_STATUS.md` - Latest status
- `/app/PROJECT_SUMMARY.md` - Full overview
- `/app/contracts.md` - API documentation

---

**Your store is now live and ready to use!** 🎉

Just refresh your browser and you should see all products loaded.
