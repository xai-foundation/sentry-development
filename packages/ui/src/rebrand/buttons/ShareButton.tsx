import React, { useState, useEffect } from 'react';

/**
 * Interface for ShareButton props
 */
interface ShareButtonProps {
    buttonTitle: string;
    buttonText: string;
    shareUrl: string;
    /** Custom CSS class for styling the button */
    shareButtonClassName?: string;
    standardButtonClassName?: string;
}

/**
 * ShareButton Component
 *
 * A button that uses the Web Share API to share a URL if supported,
 * and provides a fallback to copy the URL to the clipboard if not.
 *
 * @param {ShareButtonProps} props - Component props.
 * @param {string} [props.shareButtonClassName] - Custom CSS classes for the share button.
 * @param {string} [props.standardButtonClassName] - Custom CSS classes for the standard button if the web share API is unavailable.
 *
 * @returns {JSX.Element} - A button that enables sharing functionality.
 */
const ShareButton: React.FC<ShareButtonProps> = ({ buttonText, buttonTitle, shareUrl, shareButtonClassName,  standardButtonClassName}) => {
    const [isWebShareSupported, setIsWebShareSupported] = useState(false);

    /**
     * useEffect hook to check if the Web Share API is supported when the component mounts.
     * Sets the `isWebShareSupported` state to true or false based on browser capabilities.
     */
    useEffect(() => {
        setIsWebShareSupported(!!navigator.share);
    }, []);

    /**
     * handleShare - Triggers the Web Share API to share the current page URL.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleShare = async () => {
        try {
            await navigator.share({
                title: buttonTitle,
                text: buttonText,
                url: shareUrl
            });
            console.log('Share successful');
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    /**
     * handleFallback - Copies the current page URL to the clipboard as a fallback
     * when the Web Share API is not supported.
     */
    const handleFallback = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                console.log('URL copied to clipboard');
            })
            .catch((error) => {
                console.error('Failed to copy URL:', error);
            });
    };

    return (
        <div>
            {isWebShareSupported ? (
                <button
                    onClick={handleShare}
                    className={shareButtonClassName || 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'}
                >
                    Share this page
                </button>
            ) : (
                <button
                    onClick={handleFallback}
                    className={standardButtonClassName || 'px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'}
                >
                    Copy link to clipboard
                </button>
            )}
        </div>
    );
};

export default ShareButton;
