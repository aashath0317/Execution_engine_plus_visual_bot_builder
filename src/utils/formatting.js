export const formatTokenPrice = (price) => {
    if (!price && price !== 0) return '0.00';
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00';
    if (num === 0) return '0.00';
    if (num < 1) return num.toFixed(6);
    if (num < 10) return num.toFixed(4);
    return num.toFixed(2);
};
