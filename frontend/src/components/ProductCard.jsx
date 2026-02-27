import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useCart } from '../context/CartContext';
import { toast } from '../hooks/use-toast';
import { Star } from 'lucide-react';
import { trackAddToCart } from '../utils/metaPixel';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images || [product.image];

  const handleMouseMove = (e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const sliceWidth = width / images.length;
    let newIndex = Math.floor(x / sliceWidth);
    if (newIndex >= images.length) newIndex = images.length - 1;
    if (newIndex < 0) newIndex = 0;

    if (newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveImageIndex(0);
  };

  const handleAddToCart = () => {
    addToCart(product);

    // Track AddToCart event in Meta Pixel
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
    });

    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
          {product.badge && (
            <Badge className="absolute top-3 left-3 z-10 bg-theme-primary hover:bg-theme-primary-hover text-white">
              {product.badge}
            </Badge>
          )}

          <div
            className="aspect-square relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
              width={400}
              height={400}
            />
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1 z-20">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'w-4 bg-theme-primary' : 'w-1.5 bg-white/70'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        <div className="p-5">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-lg mb-3 line-clamp-2 min-h-[56px] hover:text-theme-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
            <span className="text-2xl font-bold text-theme-primary">₹{product.price}</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {discount}% OFF
            </Badge>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white transition-colors"
          >
            Add to bag
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
