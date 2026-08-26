// src/services/AiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export const getAiRecommendations = async (marketData) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Format Market Data for the AI to read
        // We only send the top 15 coins to save tokens and speed up response
        const coinSummary = Object.values(marketData)
            .slice(0, 15)
            .map(c =>
                `${c.symbol}: Price $${c.lastPrice}, 24h Change ${c.percentage}%, High $${c.highPrice}, Low $${c.lowPrice}`
            ).join('\n');

        console.log("--- AI DEBUG: COIN SUMMARY SENT ---");
        console.log(coinSummary);

        // 2. The Strategy Prompt
        const prompt = `
        Act as a Senior Crypto High-Frequency Trading Analyst. 
        I need the top 3 coins for a "Spot Grid Bot" with "Trailing Up" enabled.
        
        My Settings: 
        - Range: 10% Up / 10% Down
        - Grids: 30
        - Strategy: Neutral to Bullish (Trailing Up)

        Rules for selection:
        1. "Safe Climbers": Price must be up (Green) but not over-pumped (>15% is dangerous).
        2. "VIP Bias": If 'SOL', 'ETH', or 'HYPE' are in the list and have positive momentum, prioritize them.
        3. "Volatility": We need wicks. High vs Low difference should be large.
        4. "No Losers": Do not pick coins with negative 24h change.

        Analyze this market data:
        ${coinSummary}

        Return ONLY a JSON array with exactly 3 objects. No markdown, no text.
        Format:
        [
            { "symbol": "SOL/USDT", "reason": "High volatility with safe uptrend", "score": 95 },
            { "symbol": "ETH/USDT", "reason": "Reliable accumulator", "score": 90 },
            { "symbol": "XYZ/USDT", "reason": "Breakout detected", "score": 85 }
        ]
        `;

        // 3. Call the API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("--- AI DEBUG: RAW RESPONSE ---");
        console.log(text);

        // 4. Clean the response (Remove markdown code blocks if AI adds them)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return null; // Return null so we can fallback to math logic
    }
};