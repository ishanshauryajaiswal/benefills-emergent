import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo and Social */}
          <div className="flex flex-col items-start">
            <img 
              src="https://assets.zyrosite.com/AzGXppLqlGTo9X9r/benefills-png-A85M60Nx0phaMVln.png" 
              alt="Benefills" 
              className="h-32 w-auto mb-6"
            />
            <a 
              href="https://www.instagram.com/benefills.foods/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-theme-primary transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-3">
            <Link 
              to="/terms" 
              className="text-gray-700 hover:text-theme-primary transition-colors underline"
            >
              Terms and condition
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-theme-primary transition-colors underline"
            >
              Contact
            </Link>
            <Link 
              to="/returns" 
              className="text-gray-700 hover:text-theme-primary transition-colors underline"
            >
              Returns
            </Link>
            <Link 
              to="/payments-delivery" 
              className="text-gray-700 hover:text-theme-primary transition-colors underline"
            >
              Payments & Delivery
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-700 hover:text-theme-primary transition-colors underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Benefills. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
