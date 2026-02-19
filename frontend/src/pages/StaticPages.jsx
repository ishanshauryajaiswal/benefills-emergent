import React from 'react';

const StaticPageLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">{title}</h1>
          <div className="prose prose-lg max-w-none text-gray-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Terms = () => (
  <StaticPageLayout title="Terms and Conditions">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Products and Pricing</h3>
        <p>All products are listed with current pricing in INR. Prices are inclusive of all applicable taxes. We reserve the right to modify prices at any time.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payments</h3>
        <p>We partner with Razorpay for secure payment processing. We do not store your card details on our servers.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Shipping Dispatch</h3>
        <p>Orders are typically dispatched within 24-48 hours of confirmation. You will receive a tracking link via email/SMS.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Governing Law</h3>
        <p>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</p>
      </section>
    </div>
  </StaticPageLayout>
);

export const Privacy = () => (
  <StaticPageLayout title="Privacy Policy">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Collection</h3>
        <p>We collect personal information (Name, Email, Address, Phone) necessary for order fulfillment. We also collect device information to improve site performance.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Data</h3>
        <p>Payment data is handled securely by Razorpay. We do not have access to your full credit/debit card numbers.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Usage</h3>
        <p>Your data is used strictly for:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Processing and delivering your orders.</li>
          <li>Customer support and communication.</li>
          <li>Legal compliance.</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">User Rights</h3>
        <p>In accordance with the DPDP Act 2023, you have the right to request access to or deletion of your personal data by contacting us.</p>
      </section>
    </div>
  </StaticPageLayout>
);

export const Returns = () => (
  <StaticPageLayout title="Returns & Refund Policy">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">10-Day Return Policy</h3>
        <p>We accept returns within 10 days of delivery if the product is damaged, incorrect, or expired upon receipt.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Conditions</h3>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>The product must be unopened and in its original packaging (unless damaged on arrival).</li>
          <li>Proof of purchase/order number is required.</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Exchanges</h3>
        <p>We offer exchanges for damaged or wrong items. Please contact support with photos of the issue.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Cancellations</h3>
        <p>Orders can be cancelled only before they are shipped. Once shipped, they cannot be cancelled but may be eligible for return.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Refunds</h3>
        <p>Approved refunds are processed within 5-7 business days to the original payment method.</p>
      </section>
    </div>
  </StaticPageLayout>
);

export const PaymentsDelivery = () => (
  <StaticPageLayout title="Shipping & Delivery Policy">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Shipping Costs</h3>
        <p>We offer <strong>FREE Shipping</strong> on all orders above ₹3,000. Standard shipping rates apply for orders below this amount.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Dispatch Timeline</h3>
        <p>We dispatch fresh batches. Orders are processed and shipped within 7-8 days of placement.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Delivery Timeline</h3>
        <p>Once shipped, delivery typically takes 3-5 business days depending on your location.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Partners</h3>
        <p>We use trusted courier partners (via Shiprocket) to ensure your order reaches you safely.</p>
      </section>
    </div>
  </StaticPageLayout>
);

export const Contact = () => (
  <StaticPageLayout title="Contact Us">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">M/S. BENEFILLS FOODS(OPC) PRIVATE LIMITED</h3>
        <p className="whitespace-pre-line">
          <strong>Address:</strong><br/>
          Floor-4, Unit 405-411, Workflo Hitex,<br/>
          Jubilee Enclave, Madhapur,<br/>
          Hyderabad, Telangana, 500081
        </p>
      </section>
      
      <section>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> <a href="mailto:benefillsfoods@gmail.com" className="text-theme-primary hover:underline">benefillsfoods@gmail.com</a>
          </p>
          <p>
            <strong>Phone:</strong> +91 88808 10669
          </p>
        </div>
      </section>
    </div>
  </StaticPageLayout>
);
