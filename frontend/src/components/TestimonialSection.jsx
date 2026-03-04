import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { testimonials } from '../mockData';

const TestimonialSection = ({
    title,
    showCarousel = false,
    maxItems,
    showStarsHeader = false,
    showShopButton = false
}) => {
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    const displayTestimonials = maxItems ? testimonials.slice(0, maxItems) : testimonials;

    useEffect(() => {
        if (!showCarousel) return;

        const interval = setInterval(() => {
            setTestimonialIndex((prev) => (prev + 1) % (displayTestimonials?.length || 1));
        }, 3000); // changes testimonial every 3 seconds

        return () => clearInterval(interval);
    }, [showCarousel, displayTestimonials.length]);

    return (
        <section className="py-16 bg-theme-primary-section-alt text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                    {showStarsHeader && (
                        <div className="flex justify-center mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                    )}
                </div>

                {showCarousel && (
                    <div className="block md:hidden mb-8">
                        <div className="overflow-hidden w-full">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
                            >
                                {displayTestimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="w-full flex-shrink-0">
                                        <div className="mx-2 h-full">
                                            <Card className="bg-theme-glass border-white/20 h-full">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dots navigation */}
                        <div className="flex justify-center gap-2 mt-6">
                            {displayTestimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setTestimonialIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === testimonialIndex ? 'bg-white' : 'bg-white/30'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Desktop Grid View (or entirely grid view if !showCarousel) */}
                <div className={`${showCarousel ? 'hidden md:grid' : 'grid'} grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8`}>
                    {displayTestimonials.map((testimonial) => (
                        <Card key={testimonial.id} className={`${!showCarousel ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 border-0 shadow-none bg-transparent h-auto' : 'bg-theme-glass border-white/20 h-full'}`}>
                            <CardContent className={`${!showCarousel ? 'p-0' : 'p-6'}`}>
                                {showCarousel && (
                                    <div className="flex gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                )}

                                <p className="text-lg font-semibold mb-2 italic">"{testimonial.text}"</p>
                                <p className={`text-white/90 ${!showCarousel ? 'mb-6 flex-1 text-sm' : 'mb-4'}`}>{testimonial.description}</p>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className={`${!showCarousel ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover`}
                                        loading="lazy"
                                        width={showCarousel ? 48 : 40}
                                        height={showCarousel ? 48 : 40}
                                    />
                                    <span className={`font-medium ${!showCarousel ? 'text-sm' : ''}`}>{testimonial.name}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {showShopButton && (
                    <div className="text-center mt-12">
                        <Link to="/shop">
                            <Button className="bg-white text-theme-primary hover:bg-gray-100 px-8 py-6 text-lg">
                                Shop Now
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialSection;
