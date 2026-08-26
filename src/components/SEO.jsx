import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
    const siteName = 'FydBlock';
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - AI Powered Crypto Trading Automation`;
    const defaultDescription = 'FydBlock - Next-generation AI-powered crypto trading platform. Automate your trades, manage portfolios, and maximize returns with advanced algorithmic bots.';
    const metaDescription = description || defaultDescription;
    const siteUrl = 'https://fydblock.com';
    const canonicalUrl = url ? `${siteUrl}${url}` : siteUrl;
    const metaImage = image || `${siteUrl}/logo.png`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={canonicalUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
