import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { benefits, howItWorks, testimonials, instagramPosts } from '../mockData';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Zap, Heart, Sparkles, Flame, Star, Instagram } from 'lucide-react';
import TrustBadges from '../components/TrustBadges';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '../components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const iconMap = {
  Zap,
  Heart,
  Sparkles,
  Flame
};

const heroSlides = [
  {
    id: 1,
    headline: 'The most lipsmacking and clean Nut Butters, made to Benefit Health',
    subtext: 'ThyroVibe by Benefills — tasty, thyroid-friendly, on-the-go nut butters with selenium, zinc & adaptogens for clean daily thyroid support.',
    image: '/images/hero-slide-1.png',
    bgClass: 'from-amber-50 via-orange-50 to-white',
  },
  {
    id: 2,
    headline: 'Not just any BAR — Your go-to for Thyroid Nourishment',
    subtext: 'Seeds & Nuts, Herbs like Mulethi, Dates — Crunchy, Chewy, just 110 calories per bar.',
    image: '/images/hero-slide-2.png',
    bgClass: 'from-purple-100 via-purple-50 to-white',
  },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    onSelect();

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  const scrollToSlide = useCallback(
    (index) => {
      carouselApi?.scrollTo(index);
    },
    [carouselApi]
  );

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
      <section className="relative bg-gradient-to-b from-purple-50 to-white overflow-hidden">
        <Carousel
          className="w-full"
          opts={{ loop: true, align: 'start' }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          setApi={setCarouselApi}
        >
          <CarouselContent className="-ml-0">
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0">
                <div
                  className={`bg-gradient-to-b ${slide.bgClass} py-16 md:py-20 lg:py-24`}
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                      {/* Text Column */}
                      <div className="text-center md:text-left order-2 md:order-1">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                          {slide.headline}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-xl mb-8">
                          {slide.subtext}
                        </p>
                        <Link to="/shop">
                          <Button className="bg-theme-primary hover:bg-theme-primary-hover text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                            Shop Now
                          </Button>
                        </Link>
                      </div>
                      {/* Image Column */}
                      <div className="order-1 md:order-2 flex justify-center">
                        <img
                          src={slide.image}
                          alt={slide.headline}
                          width={512}
                          height={512}
                          className="w-full max-w-lg rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform duration-500"
                          fetchpriority={slide.id === 1 ? "high" : "low"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`rounded-full transition-all duration-300 ${currentSlide === index
                    ? 'w-8 h-3 bg-theme-primary'
                    : 'w-3 h-3 bg-gray-400/50 hover:bg-gray-500/70'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>

        {/* Trust Badges — Static below carousel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Instagram Section */}
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
                  loading="lazy"
                  width={300}
                  height={300}
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
