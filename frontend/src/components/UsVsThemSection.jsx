import React from 'react';
import { X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const UsVsThemSection = () => {
    const generalSnacks = [
        "Focus on protein or calories",
        "No targeted selenium or zinc",
        "Generic superfood blends",
        "Inconsistent daily intake",
        "Designed for trends — not thyroid"
    ];

    const thyroVibeBenefits = [
        "Selenium from real Brazil nuts",
        "Zinc from pumpkin seeds",
        "Adaptogens for stress balance",
        "Fiber for gut–thyroid support",
        "Measured daily ritual (1 tbsp or 1 bar)"
    ];

    return (
        <section className="pt-8 pb-20 bg-gray-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-12 leading-tight">
                    Not just healthy. <span className="text-theme-primary">Targeted.</span>
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:gap-8 max-w-5xl mx-auto">
                    {/* The "Them" Column */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-8 flex flex-col items-center">
                        <div className="w-full h-24 sm:h-56 mb-4 sm:mb-8 flex justify-center items-center rounded-xl sm:rounded-2xl bg-gray-50 overflow-hidden">
                            <img
                                src="/images/generic-snacks.png"
                                alt="Generic Healthy Snacks"
                                className="h-full object-contain mix-blend-multiply opacity-80"
                                loading="lazy"
                            />
                        </div>
                        <h3 className="text-base sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-8 text-center leading-tight">General "Healthy" Snacks</h3>
                        <ul className="text-left w-full space-y-3 sm:space-y-5">
                            {generalSnacks.map((snack, idx) => (
                                <li key={idx} className="flex items-start gap-2 sm:gap-4">
                                    <X className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                                    <span className="text-xs sm:text-lg text-gray-600">{snack}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* The "Us" (ThyroVibe) Column */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border sm:border-2 border-theme-primary p-4 sm:p-8 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-theme-primary text-white px-2 py-1 sm:px-5 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl font-bold text-[10px] sm:text-sm shadow-md">
                            The Solution
                        </div>
                        <div className="w-full h-24 sm:h-56 mb-4 sm:mb-8 flex justify-center items-center rounded-xl sm:rounded-2xl bg-purple-50 overflow-hidden">
                            <img
                                src="/images/thyrovibe-care-pack-updated.png"
                                alt="ThyroVibe Daily Ritual"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                        <h3 className="text-base sm:text-2xl font-bold text-theme-primary mb-4 sm:mb-8 text-center leading-tight">ThyroVibe</h3>
                        <ul className="text-left w-full space-y-3 sm:space-y-5">
                            {thyroVibeBenefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 sm:gap-4">
                                    <Check className="w-4 h-4 sm:w-6 sm:h-6 text-theme-primary mt-1 flex-shrink-0" />
                                    <span className="text-xs sm:text-lg text-gray-800 font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 sm:mt-10 w-full flex-grow flex flex-col justify-end">
                            <Link to="/shop">
                                <Button className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white py-4 sm:py-6 text-xs sm:text-lg rounded-xl shadow-md transition-all font-bold whitespace-normal h-auto text-center leading-tight">
                                    Start Your Ritual
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UsVsThemSection;
