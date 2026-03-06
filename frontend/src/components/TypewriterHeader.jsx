import React, { useState, useEffect } from 'react';

const TypewriterHeader = ({ words }) => {
    const [typewriterText, setTypewriterText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const i = loopNum % words.length;
            const fullText = words[i];

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
    }, [typewriterText, isDeleting, loopNum, typingSpeed, words]);

    // Find the longest word to act as an invisible spatial placeholder
    const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');

    return (
        <span className="text-theme-primary inline-grid mt-2 relative items-center text-left align-bottom">
            {/* Invisible placeholder to keep the container size fixed to the maximum text width/height */}
            <span className="invisible col-start-1 row-start-1 select-none" aria-hidden="true">
                {longestWord}
            </span>

            {/* Typing text overlaid perfectly on top */}
            <span className="col-start-1 row-start-1 h-full w-full">
                <span className="relative inline-flex h-full items-center">
                    <span aria-hidden="true">{typewriterText}</span>
                    <span className="animate-pulse absolute -right-1 top-0 bottom-0 border-r-4 border-theme-primary"></span>
                </span>
            </span>
            <span className="sr-only">{words.join(', ')}</span>
        </span>
    );
};

export default TypewriterHeader;
