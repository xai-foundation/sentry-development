import React from 'react';
import { ShareIcon } from '../icons/IconsComponents';

/**
 * Interface for ShareButton props
 */
interface ShareButtonProps {
    /** Title to be shared */
    buttonTitle: string;
    /** Text content to be shared */
    buttonText: string;
    /** URL to be shared */
    shareUrl: string;
    /** Custom CSS class for styling if needed */
    shareButtonClassName?: string;
}

/**
 * ShareButton Component
 *
 * A button that uses the Web Share API to share a URL if supported.
 *
 * @param {ShareButtonProps} props - Component props.
 * @param {string} props.buttonText - The text to be shared.
 * @param {string} props.buttonTitle - The title to be shared.
 * @param {string} props.shareUrl - The URL to be shared.
 * @param {string} [props.shareButtonClassName] - Custom CSS classes for the share button.
 *
 * @returns {JSX.Element} - A button that enables sharing functionality.
 */
const ShareButton: React.FC<ShareButtonProps> = ({ buttonText, buttonTitle, shareUrl, shareButtonClassName }) => {

    /**
     * handleShare - Triggers the Web Share API to share the provided title, text, and URL.
     * Checks if the Web Share API is available before sharing.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: buttonTitle,
                    text: buttonText,
                    url: shareUrl,
                });
                console.log('Shared successfully');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            console.error('Web Share API is not supported in this browser.');
        }
    };

    return (
        <button
            onClick={handleShare}
            className={shareButtonClassName || 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-red-600'}
            aria-label="Share this content" // Add accessibility label
        >
            <ShareIcon />
        </button>
    );
};

export default ShareButton;
