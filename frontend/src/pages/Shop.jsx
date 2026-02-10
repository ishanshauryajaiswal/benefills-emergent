import React, { useState } from 'react';
import { products } from '../mockData';
import ProductCard from '../components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Shop = () => {
  const [sortBy, setSortBy] = useState('default');
  const [filteredProducts, setFilteredProducts] = useState(products);

  const handleSort = (value) => {
    setSortBy(value);
    let sorted = [...products];
    
    switch(value) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
        // Keep default order for most recent
        break;
      default:
        sorted = products;
    }
    
    setFilteredProducts(sorted);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop All Products</h1>
          <p className="text-gray-600">Discover our thyroid-supporting nutrition</p>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">{filteredProducts.length} products</p>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="price-high">Price (high to low)</SelectItem>
                <SelectItem value="price-low">Price (low to high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
