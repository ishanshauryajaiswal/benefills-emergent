import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { benefits, howItWorks, testimonials, instagramPosts } from '../mockData';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Zap, Heart, Sparkles, Flame, Star, Instagram } from 'lucide-react';

const iconMap = {
  Zap,
  Heart,
  Sparkles,
  Flame
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6FA78E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-100 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <img 
                src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/AzGXppLqlGTo9X9r/weare-not-just-any-bar-a-weare-your-go-to-for-thyroid-nourishment.-crunchy-chewy-110-calories-4-YYdpCsGZqqkCVO0J.png"
                alt="Thyrovibe Bar"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <div className="inline-block bg-[#F5E6D3] rounded-lg px-6 py-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                  Thyroid Nourishment
                </h1>
              </div>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="text-[#6FA78E]">•</span> Ready to eat
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#6FA78E]">•</span> Made for hormone health
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#6FA78E]">•</span> No refined sugar
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#6FA78E]">•</span> No preservatives
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Our Products</h2>
            <Link to="/shop">
              <Button variant="outline" className="border-[#6FA78E] text-[#6FA78E] hover:bg-[#6FA78E] hover:text-white">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Benefills Works */}
      <section className="py-16 bg-[#6FA78E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Benefills Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-white/90">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button className="bg-white text-[#6FA78E] hover:bg-gray-100 px-8 py-6 text-lg">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button className="bg-[#6FA78E] hover:bg-[#5d8e76] text-white px-8 py-6 text-lg">
                TRY NOW
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#6FA78E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Real people, Real results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-lg font-semibold mb-3 italic">"{testimonial.text}"</p>
                  <p className="text-white/90 mb-4">{testimonial.description}</p>
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button className="bg-white text-[#6FA78E] hover:bg-gray-100 px-8 py-6 text-lg">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Community and Socials</h2>
            <a 
              href="https://www.instagram.com/benefills.foods/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#6FA78E] hover:text-[#5d8e76] font-medium"
            >
              <Instagram className="h-5 w-5" />
              @benefills.foods
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramPosts.map((post, index) => (
              <div 
                key={index} 
                className="aspect-square overflow-hidden rounded-lg group cursor-pointer"
              >
                <img 
                  src={post} 
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
