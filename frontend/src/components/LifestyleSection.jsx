import React from 'react';

const lifestyleMoments = [
    {
        icon: "🫙",
        title: "Straight from the jar",
        description: "A spoon, the jar, done. The easiest 30 seconds of your day.",
        image: "/images/lifestyle/jar_spoon.png"
    },
    {
        icon: "🥣",
        title: "On your smoothie bowl",
        description: "Swirl it on top. Breakfast just got a thyroid upgrade.",
        image: "/images/lifestyle/smoothie_bowl.png"
    },
    {
        icon: "🍘",
        title: "On a rice cracker",
        description: "Your mid-morning snack, now actually working for you.",
        image: "/images/lifestyle/rice_cracker.png"
    },
    {
        icon: "🏋️",
        title: "Bar as your pre-workout",
        description: "Fuel up before you move. Your thyroid loves the combo.",
        image: "/images/lifestyle/pre_workout.png"
    },
    {
        icon: "💻",
        title: "4pm hunger at your desk",
        description: "Reach for the bar instead of biscuits. Same satisfaction, real nutrition.",
        image: "/images/lifestyle/desk_bar.png"
    },
    {
        icon: "🚌",
        title: "On your commute",
        description: "Bar in your bag. Ritual intact. Even on your busiest days.",
        image: "/images/lifestyle/commute_bar.png"
    }
];

const LifestyleSection = () => {
    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-theme-primary mb-3 md:mb-4 leading-tight">
                        Seamlessly Fits Into Your Day
                    </h2>
                    <p className="text-base md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                        Your daily thyroid ritual, made effortless. No matter how busy you are, we've got a moment for you.
                    </p>
                </div>

                {/* Mobile Horizontal Snap Scroll / Desktop Grid */}
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-12 md:overflow-visible md:px-0 md:mx-0">
                    {lifestyleMoments.map((moment, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[90vw] sm:w-[85vw] md:w-auto snap-center snap-always mr-4 md:mr-0 flex flex-col group h-full cursor-default bg-white rounded-3xl p-4 md:p-0 md:bg-transparent shadow-lg md:shadow-none border border-gray-100 md:border-none"
                        >
                            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm mb-5 bg-gray-200">
                                <img
                                    src={moment.image}
                                    alt={moment.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-start px-2 md:px-2">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2 md:gap-3 leading-tight">
                                    <span className="text-2xl md:text-3xl drop-shadow-sm" aria-hidden="true">{moment.icon}</span>
                                    {moment.title}
                                </h3>
                                <p className="text-base md:text-lg text-gray-600 leading-relaxed font-medium">
                                    {moment.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
        </section>
    );
};

export default LifestyleSection;
