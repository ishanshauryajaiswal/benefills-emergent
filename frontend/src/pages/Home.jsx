import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { benefits, howItWorks, testimonials } from '../mockData';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Zap, Heart, Sparkles, Flame, Star, Instagram } from 'lucide-react';
import TrustBadges from '../components/TrustBadges';
const iconMap = {
  Zap,
  Heart,
  Sparkles,
  Flame
};

const rotatingWords = ["clean.", "tasty.", "health-focused.", "thyroid-friendly."];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % rotatingWords.length;
      const fullText = rotatingWords[i];

      setTypewriterText(
        isDeleting
          ? fullText.substring(0, typewriterText.length - 1)
          : fullText.substring(0, typewriterText.length + 1)
      );

      let nextSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && typewriterText === fullText) {
        nextSpeed = 2000;
        setIsDeleting(true);
      } else if (isDeleting && typewriterText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        nextSpeed = 500;
      }

      setTypingSpeed(nextSpeed);
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, loopNum, typingSpeed]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-[100vh] flex flex-col justify-center bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16 md:mt-20 flex-1 flex items-center">
          <div className="flex flex-col lg:flex-row w-full items-center justify-between gap-12 lg:gap-8">
            {/* Left Column (Text Block - ~55%) */}
            <div className="flex-[0_0_100%] lg:flex-[0_0_55%] flex flex-col justify-center text-center lg:text-left pt-8 lg:pt-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight min-h-[120px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[220px]">
                The most lipsmacking Nut Butters, made to be
                <br className="hidden sm:block" />
                <span className="text-theme-primary inline-flex relative mt-2">
                  <span aria-hidden="true">{typewriterText}</span>
                  <span className="animate-pulse absolute -right-1 top-0 bottom-0 border-r-4 border-theme-primary"></span>
                  <span className="sr-only">{rotatingWords.join(', ')}</span>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 line-clamp-3">
                ThyroVibe by Benefills — tasty, thyroid-friendly, on-the-go nut butters with selenium, zinc & adaptogens for clean daily thyroid support. Every spoonful is a step towards better health.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link to="/shop">
                  <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white px-10 py-7 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column (Image Placeholder - 45%) */}
            <div className="flex-[0_0_100%] lg:flex-[0_0_45%] w-full flex justify-center items-center mt-12 lg:mt-0">
              <div className="w-full max-w-[450px] lg:max-w-[550px] aspect-[4/5] md:aspect-[3/4] lg:aspect-square relative rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
                <img
                  src="/images/hero-slide-1.png"
                  alt="ThyroVibe Nut Butters"
                  className="object-cover w-full h-full"
                  fetchpriority="high"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges — Static below hero */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
          <TrustBadges />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Our Products</h2>
            <Link to="/shop">
              <Button variant="outline" className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white">
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
      <section className="py-16 bg-theme-primary-section text-white">
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
              <Button className="bg-white text-theme-primary hover:bg-gray-100 px-8 py-6 text-lg">
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
              <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white px-8 py-6 text-lg">
                TRY NOW
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-theme-primary-section-alt text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Real people, Real results</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-theme-glass border-white/20">
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
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button className="bg-white text-theme-primary hover:bg-gray-100 px-8 py-6 text-lg">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Section - SnapWidget Embed */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Community and Socials</h2>
            <a
              href="https://www.instagram.com/benefills.foods/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-theme-primary hover:text-[#5d8e76] font-medium"
            >
              <Instagram className="h-5 w-5" />
              @benefills.foods
            </a>
          </div>

          {/* SnapWidget Instagram Feed Embed - Replace WIDGET_ID with your actual widget ID from snapwidget.com */}
          <div className="flex justify-center" id="instagram-feed-container">
            <script src="https://snapwidget.com/js/snapwidget.js"></script>
            <iframe
              src="https://snapwidget.com/embed/1089953"
              className="snapwidget-widget"
              allowTransparency="true"
              frameBorder="0"
              scrolling="no"
              style={{
                border: 'none',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '1000px',
                height: '500px'
              }}
              title="Instagram Feed @benefills.foods"
              loading="lazy"
            />
          </div>

          {/* Follow Button */}
          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/benefills.foods/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <Instagram className="h-5 w-5" />
              Follow us on Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
