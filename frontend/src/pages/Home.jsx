import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { benefits } from '../mockData';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import LifestyleSection from '../components/LifestyleSection';
import TypewriterHeader from '../components/TypewriterHeader';
import TestimonialSection from '../components/TestimonialSection';
import { Zap, Heart, Sparkles, Flame, Star, Instagram } from 'lucide-react';

const rotatingWords = ["Thyroid Nourishment.", "Targeted Nutrition.", "Hormone Balance."];

const iconMap = {
  Zap,
  Heart,
  Sparkles,
  Flame
};

const rotatingSymptoms = ["feeling tired?", "losing hair?", "weight resistance?", "dull skin?", "Brain Fog?"];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symptomIndex, setSymptomIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Hero Image swapping state
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroImages = [
    "/images/thyrovibe-care-pack-updated.png",
    "/images/hero 2.png"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setSymptomIndex((prev) => (prev + 1) % rotatingSymptoms.length);
        setFade(true);
      }, 500);

    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  // Effect for hero image auto-swapping
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500); // changes image every 3.5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

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
      <section className="relative w-full pt-10 lg:pt-14 pb-12 flex flex-col justify-start bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center">
          <div className="flex flex-col lg:flex-row w-full items-center justify-between gap-12 lg:gap-8">
            {/* Left Column (Text Block - ~55%) */}
            <div className="flex-[0_0_100%] lg:flex-[0_0_55%] flex flex-col justify-center text-center lg:text-left pt-4 lg:pt-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-4 leading-tight min-h-[84px] sm:min-h-[100px] md:min-h-[110px] lg:min-h-[160px]">
                The most lipsmacking Nut Butters and Bars made for
                <br className="hidden sm:block" />
                <TypewriterHeader words={rotatingWords} />
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 line-clamp-3">
                A daily ritual which you will happily stick to and regain wellness
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link to="/shop">
                  <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white px-10 py-7 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column (Image Auto-Swapper - 45%) */}
            <div className="flex-[0_0_100%] lg:flex-[0_0_45%] w-full flex justify-center items-center mt-12 lg:mt-0">
              <div className="w-full max-w-[450px] lg:max-w-[550px] aspect-[4/5] md:aspect-[3/4] lg:aspect-square relative rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02] bg-white">
                {heroImages.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={`ThyroVibe Hero ${idx + 1}`}
                    className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-1000 ease-in-out ${heroImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    fetchpriority={idx === 0 ? "high" : "low"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Running Text Banner Below Hero */}
        <div className="w-full bg-theme-primary overflow-hidden flex relative z-20 py-3 mt-8 selection:bg-transparent">
          <div className="flex animate-marquee whitespace-nowrap w-max">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-lg md:text-xl font-semibold px-6 text-white uppercase tracking-wider">
                Selenium-Magnesium-Zinc Rich Ingredients &bull; Powered with Adaptogens &bull; Based on Real Whole Foods &bull; Thyroid Nourishing &bull; Vegan &bull; No added sugar &bull; No preservatives &bull;
              </span>
            ))}
          </div>
        </div>

        {/* Target Nutrition Problem Section */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100 flex flex-col items-center gap-12 text-center">

            {/* Copy */}
            <div className="w-full max-w-4xl">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight min-h-[160px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[180px]">
                Tired of
                <br />
                <span className="text-theme-primary inline-flex relative mt-2 justify-center">
                  <span
                    aria-hidden="true"
                    className={`transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {rotatingSymptoms[symptomIndex]}
                  </span>
                  <span className="sr-only">{rotatingSymptoms.join(', ')}</span>
                </span>
              </h2>

              <div className="bg-orange-50 p-6 md:p-10 rounded-2xl border border-orange-100">
                <p className="text-xl md:text-2xl font-bold text-gray-800 mb-4 max-w-3xl mx-auto">
                  Doing everything right and still feeling like this?
                </p>
                <p className="text-lg md:text-xl text-gray-600 mb-2 max-w-3xl mx-auto">
                  It's not your fault. Most efforts to improve thyroid symptoms don't work because daily Targeted Nutrition is the missing link.
                </p>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Benefills ThyroVibe is exactly that. Its your monthly food ritual — real ingredients your thyroid actually needs.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link to="/shop">
                    <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Start Your Ritual
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Thyrovibe Ritual Pack Introduction Section */}
      <section className="pt-6 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-theme-primary mb-5 leading-tight max-w-5xl mx-auto">
            Everything you need for thyroid targeted nutrition- wrapped in a monthly pack.
          </h2>
          <p className="text-2xl md:text-3xl text-gray-800 font-medium mb-10 italic">
            "One tablespoon or one bar. Every day. No guesswork."
          </p>

          <div className="w-full flex justify-center items-center">
            <div className="w-full max-w-4xl relative rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02] bg-gradient-to-b from-purple-50/30 to-white">
              <img
                src="/images/thyrovibe-care-pack-updated.png"
                alt="Thyrovibe Monthly Ritual Pack"
                className="w-full h-auto object-cover rounded-3xl"
                loading="lazy"
              />
            </div>
          </div>

          <div className="mt-16">
            <Link to="/shop">
              <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white px-12 py-7 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold">
                Shop Monthly Pack
              </Button>
            </Link>
          </div>
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

          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 sm:mx-0">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[85vw] sm:w-auto snap-center snap-always mr-4 sm:mr-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Benefills Works */}
      <section className="py-16 bg-theme-primary-section text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Benefills Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

      {/* Testimonials */}
      <TestimonialSection
        title="Real people, Real results"
        showCarousel={true}
        showShopButton={true}
      />

      {/* Lifestyle Section */}
      <LifestyleSection />

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
    </div >
  );
};

export default Home;
