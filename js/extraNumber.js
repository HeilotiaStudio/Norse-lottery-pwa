/**
 * Extra Number Calculator - The Crown Jewel
 * Combines cosmic alignment with statistical data
 */

export class ExtraNumberCalculator {
    constructor(patternAnalyzer, astrologyEngine) {
        this.patternAnalyzer = patternAnalyzer;
        this.astrology = astrologyEngine;
    }

    /**
     * Calculate the extra number (Crown Jewel)
     * @param {number} zodiacDegree - Degree within zodiac (0-29)
     * @param {Object} planetaryData - Planetary data
     * @returns {Object} Extra number result
     */
    calculate(zodiacDegree, planetaryData) {
        // 1. Cosmic distance
        const cosmicDistance = Math.abs(planetaryData.sunDegree - zodiacDegree);
        
        // 2. Moon modifier
        const moonModifier = this.astrology.getMoonModifier();
        
        // 3. Retrograde modifier
        const retrogradeModifier = this.astrology.getRetrogradeModifier();
        
        // 4. Statistical weight
        const history = this.patternAnalyzer.csvManager.history;
        let statisticalWeight = 0;
        let hotWeight = 0;
        let coldWeight = 0;
        let gapWeight = 0;
        
        if (history.length > 0) {
            const hot = this.patternAnalyzer.getHotNumbers(5);
            const cold = this.patternAnalyzer.getColdNumbers(5);

            hotWeight = hot.length > 0 ? hot.reduce((sum, n) => sum + n, 0) / hot.length : 0;
            coldWeight = cold.length > 0 ? cold.reduce((sum, n) => sum + n, 0) / cold.length : 0;

            const gaps = this.patternAnalyzer.gaps;
            const gapValues = Object.values(gaps)
                .filter(g => g.length > 0)
                .map(g => g[g.length - 1]);
            gapWeight = gapValues.length > 0
                ? gapValues.reduce((a, b) => a + b, 0) / gapValues.length
                : 0;

            statisticalWeight = (hotWeight * 0.3 + coldWeight * 0.3 + gapWeight * 0.4);
            if (!isFinite(statisticalWeight)) statisticalWeight = 0;
        }
        
        // 5. Quantum influence
        const quantumInfluence = (Math.random() - 0.5) * 5;
        
        // 6. Combine all factors
        let extraNumber = (
            cosmicDistance * 0.2 +
            moonModifier * 0.15 +
            retrogradeModifier * 0.15 +
            statisticalWeight * 0.3 +
            quantumInfluence * 0.2
        );
        
        // 7. Normalize to 1-49
        extraNumber = Math.floor(Math.abs(extraNumber) % 49) + 1;
        
        // 8. Ensure number is valid
        extraNumber = Math.max(1, Math.min(49, extraNumber));
        
        // 9. Generate flavor text
        const flavor = this.generateFlavor(
            extraNumber, 
            cosmicDistance, 
            moonModifier, 
            retrogradeModifier, 
            statisticalWeight, 
            quantumInfluence
        );
        
        return {
            number: extraNumber,
            factors: {
                cosmicDistance: Math.round(cosmicDistance),
                moonModifier: moonModifier,
                retrogradeModifier: retrogradeModifier,
                statisticalWeight: Math.round(statisticalWeight),
                quantumInfluence: Math.round(quantumInfluence)
            },
            flavor: flavor
        };
    }

    /**
     * Generate flavor text for the extra number
     * @param {number} number - The extra number
     * @param {number} cosmicDistance - Cosmic distance
     * @param {number} moonModifier - Moon modifier
     * @param {number} retrogradeModifier - Retrograde modifier
     * @param {number} statisticalWeight - Statistical weight
     * @param {number} quantumInfluence - Quantum influence
     * @returns {string} Flavor text
     */
    generateFlavor(number, cosmicDistance, moonModifier, retrogradeModifier, statisticalWeight, quantumInfluence) {
        const moonPhase = this.astrology.getMoonPhase();
        const retro = this.astrology.getRetrogradeStatus();
        
        let retroText = '';
        if (retro.mercury) retroText += ' Mercury Rx';
        if (retro.venus) retroText += ' Venus Rx';
        if (retro.mars) retroText += ' Mars Rx';
        
        if (retroText) retroText = ' (Retrograde:' + retroText + ')';
        
        let flavor = `🌟 The Norns weave fate! `;
        flavor += `Cosmic distance (${Math.round(cosmicDistance)}°), `;
        flavor += `${moonPhase.emoji} ${moonPhase.name} (${moonModifier}), `;
        flavor += `${retroText || 'No retrogrades'}, `;
        flavor += `Statistics (${Math.round(statisticalWeight)}), `;
        flavor += `and Quantum (${Math.round(quantumInfluence)}) `;
        flavor += `converge to ${number}! `;
        
        // Add special flavor for certain numbers
        if (number === 7 || number === 13 || number === 21 || number === 42) {
            flavor += ` 🔮 A sacred number!`;
        }
        
        if (number % 2 === 0) {
            flavor += ` The cosmos favors balance.`;
        } else {
            flavor += ` The cosmos favors chaos.`;
        }
        
        return flavor;
    }

    /**
     * Get a quick prediction based on the extra number
     * @param {number} number - The extra number
     * @returns {string} Prediction
     */
    getPrediction(number) {
        const predictions = {
            low: 'Humble beginnings lead to great fortune.',
            mid: 'The middle path is the wisest choice.',
            high: 'Reach for the stars, the cosmos supports you!',
            prime: 'Prime numbers bring pure energy!',
            even: 'Balance is key to your success.',
            odd: 'Embrace the chaos, it brings opportunity.'
        };
        
        let prediction = '';
        if (number <= 16) prediction = predictions.low;
        else if (number <= 33) prediction = predictions.mid;
        else prediction = predictions.high;
        
        // Check if prime
        const isPrime = this.isPrime(number);
        if (isPrime) prediction += ' ' + predictions.prime;
        
        if (number % 2 === 0) {
            prediction += ' ' + predictions.even;
        } else {
            prediction += ' ' + predictions.odd;
        }
        
        return prediction;
    }

    /**
     * Check if a number is prime
     * @param {number} num - Number to check
     * @returns {boolean} True if prime
     */
    isPrime(num) {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return true;
    }
}