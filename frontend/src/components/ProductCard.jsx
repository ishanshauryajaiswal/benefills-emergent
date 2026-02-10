import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useCart } from '../context/CartContext';
import { toast } from '../hooks/use-toast';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          {product.badge && (
            <Badge className="absolute top-3 left-3 z-10 bg-[#6FA78E] hover:bg-[#5d8e76] text-white">
              {product.badge}
            </Badge>
          )}
          
          <div className="aspect-square overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 min-h-[56px]">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
            <span className="text-2xl font-bold text-[#6FA78E]">₹{product.price}</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {discount}% OFF
            </Badge>
          </div>

          <Button 
            onClick={handleAddToCart}
            className="w-full bg-[#6FA78E] hover:bg-[#5d8e76] text-white transition-colors"
          >
            Add to bag
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
