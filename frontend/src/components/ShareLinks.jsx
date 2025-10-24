// LitInvestorBlog-frontend/src/components/ShareLinks.jsx
// ✅ MOBILE OPTIMIZED
// ✅ CORRECT DEVICE DETECTION (SCREEN WIDTH)
// ✅ ALL UNITS IN REM

import React, { useState, useEffect } from 'react';
import { Linkedin, Mail, Link, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { SiX } from 'react-icons/si';

// --- MODIFICA: Breakpoint definito in rem (768px / 16px = 48rem) ---
const MOBILE_BREAKPOINT_REM = 48;

const ShareLinks = ({ articleTitle }) => {
  const [copied, setCopied] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);

  useEffect(() => {
    const checkDeviceFeatures = () => {
      // --- MODIFICA: Logica di confronto che usa il breakpoint in rem ---
      // Calcoliamo la larghezza in rem per un confronto corretto
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setIsMobileView(window.innerWidth / rootFontSize < MOBILE_BREAKPOINT_REM);

      if (navigator.share) {
        setIsNativeShareSupported(true);
      }
    };

    checkDeviceFeatures();
    window.addEventListener('resize', checkDeviceFeatures);

    return () => {
      window.removeEventListener('resize', checkDeviceFeatures);
    };
  }, []);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedTitle = encodeURIComponent(articleTitle);
  const encodedUrl = encodeURIComponent(pageUrl);

  const desktopShareOptions = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: 'X',
      icon: SiX,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Mail',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`,
    },
  ];

  const copyLink = () => {
    navigator.clipboard
      .writeText(pageUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error('Failed to copy link.');
        console.error('Copy link error:', err);
      });
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: articleTitle,
        text: `Check out this article: ${articleTitle}`,
        url: pageUrl,
      });
    } catch (error) {
      console.log('Share action cancelled or failed', error);
    }
  };

  if (isMobileView && isNativeShareSupported) {
    return (
      <button
        onClick={handleNativeShare}
        aria-label="Share article"
        // --- MODIFICA: Spaziature (gap, py, px) rese esplicite in rem ---
        className="flex items-center justify-center gap-[0.5rem] py-[0.5rem] rounded-full text-dark-gray bg-gray-100 hover:bg-gray-200 transition-colors"
        type="button"
      >
        <Share2 className="w-[1.25rem] h-[1.25rem]" />
        <span className="font-semibold">Share</span>
      </button>
    );
  }

  return (
    <div className="flex justify-start items-center gap-[0.375rem] sm:gap-[0.5rem]">
      {desktopShareOptions.map((option) => (
        <a
          key={option.name}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${option.name}`}
          className="p-[0.5rem] rounded-full text-dark-gray hover:text-blue-600 transition-colors flex items-center justify-center"
        >
          <option.icon className="w-[1.25rem] h-[1.25rem]" />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="p-[0.5rem] rounded-full text-dark-gray hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center"
        type="button"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && copyLink()}
      >
        {copied ? (
          <Check className="w-[1.25rem] h-[1.25rem] text-green" />
        ) : (
          <Link className="w-[1.25rem] h-[1.25rem]" />
        )}
      </button>
    </div>
  );
};

export default ShareLinks;