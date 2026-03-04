import { useState, useCallback } from 'react';

/**
 * Custom hook to manage hover-based image switching over a series of images
 * based on the cursor's horizontal position within the container.
 *
 * @param {string[]} images - Array of image URLs
 * @returns {object} { activeImageIndex, handleMouseMove, handleMouseLeave }
 */
export const useImageHover = (images) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const handleMouseMove = useCallback((e) => {
        if (!images || images.length <= 1) return;

        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const sliceWidth = width / images.length;
        let newIndex = Math.floor(x / sliceWidth);

        // Bounds checking
        if (newIndex >= images.length) newIndex = images.length - 1;
        if (newIndex < 0) newIndex = 0;

        if (newIndex !== activeImageIndex) {
            setActiveImageIndex(newIndex);
        }
    }, [images, activeImageIndex]);

    const handleMouseLeave = useCallback(() => {
        if (!images || images.length <= 1) return;
        setActiveImageIndex(0);
    }, [images]);

    return { activeImageIndex, handleMouseMove, handleMouseLeave };
};
