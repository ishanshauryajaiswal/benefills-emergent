import React from 'react';
import { Check } from 'lucide-react';

const TrustBadges = () => {
    const badges = [
        "Ready to eat",
        "Made for hormone health",
        "No refined sugar",
        "No preservatives"
    ];

    return (
        <div className="space-y-4 text-gray-700">
            {badges.map((badge, index) => (
                <p key={index} className="flex items-center gap-3 text-lg">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-theme-primary/10 text-theme-primary">
                        <Check className="w-5 h-5" />
                    </span>
                    <span className="font-medium">{badge}</span>
                </p>
            ))}
        </div>
    );
};

export default TrustBadges;
