/**
 * Trials Engine - The 5 Divine Trials
 * Each trial generates a number with flavor text and color
 */

export class TrialsEngine {
    constructor(patternAnalyzer, quantumModifier, astrologyEngine) {
        this.patternAnalyzer = patternAnalyzer;
        this.quantum = quantumModifier;
        this.astrology = astrologyEngine;
    }

    /**
     * Trial 1: Rival's Wrath
     * Based on opposing zodiac sign and pattern analysis
     */
    rivalWrath(zodiac, planetaryData) {
        const suggestions = this.patternAnalyzer.getSuggestions(3);
        const baseNumber = suggestions[0] || Math.floor(Math.random() * 49) + 1;
        
        const quantumResult = this.quantum.applySuperposition(baseNumber);
        const tunnelResult = this.quantum.quantumTunnel(quantumResult.collapsed);
        
        const finalNumber = tunnelResult.tunneled ? tunnelResult.new : quantumResult.collapsed;
        
        // Get opposing sign
        const opposingSign = this.astrology.getOpposingSign(zodiac.id);
        
        return {
            number: finalNumber,
            flavor: `🔥 Your rival ${opposingSign?.name || 'unknown'} trembles! Pattern analysis suggests ${baseNumber}, but quantum reality collapsed to ${finalNumber}!`,
            color: '#ff6b35'
        };
    }

    /**
     * Trial 2: Thor's Hammer
     * Based on weather data and hot/cold numbers
     */
    thorsHammer(weather) {
        const hot = this.patternAnalyzer.getHotNumbers(5);
        const cold = this.patternAnalyzer.getColdNumbers(5);
        
        const useHot = weather.temperature > 20 ? 0.7 : 0.3;
        const pool = Math.random() < useHot ? hot : cold;
        
        let baseNumber = pool.length > 0 
            ? pool[Math.floor(Math.random() * pool.length)]
            : Math.floor(Math.random() * 49) + 1;
            
        const pressure = weather.pressure % 49 + 1;
        let finalNumber = (baseNumber + pressure) % 49 + 1;
        
        // Apply quantum fluctuation
        const fluctuation = this.quantum.quantumFluctuation(finalNumber, 0.5);
        finalNumber = fluctuation.result;
        
        const emoji = weather.isFallback ? '⚡' : '🌩️';
        
        return {
            number: finalNumber,
            flavor: `${emoji} Mjolnir strikes! ${weather.temperature}°C ${weather.conditions} shifts fate! Pressure ${weather.pressure}hPa → ${finalNumber}`,
            color: '#4ecdc4'
        };
    }

    /**
     * Trial 3: Odin's Gaze
     * Based on gap analysis and time magic
     */
    odinsGaze(planetaryData) {
        const dueNumbers = this.patternAnalyzer.getDueNumbers(5);
        let baseNumber = dueNumbers.length > 0 
            ? dueNumbers[Math.floor(Math.random() * dueNumbers.length)]
            : Math.floor(Math.random() * 49) + 1;
            
        const timeMagic = (planetaryData.sunDegree + planetaryData.dayOfYear) % 49 + 1;
        let finalNumber = (baseNumber + timeMagic) % 49 + 1;
        
        // Apply superposition
        const quantumResult = this.quantum.applySuperposition(finalNumber);
        finalNumber = quantumResult.collapsed;
        
        const gapInfo = this.patternAnalyzer.getGapHistory(baseNumber);
        const lastGap = gapInfo.length > 0 ? gapInfo[gapInfo.length - 1] : 'unknown';
        
        return {
            number: finalNumber,
            flavor: `👁️ Odin sees through time! Number ${baseNumber} is due (last gap: ${lastGap}). Time bends to ${finalNumber}!`,
            color: '#ffe66d'
        };
    }

    /**
     * Trial 4: Loki's Trickery
     * Based on entangled pairs and Schrödinger's parity
     */
    lokisTrickery(weather, zodiac) {
        const pairs = this.patternAnalyzer.getTopPairs(10);
        let baseNumber = Math.floor(Math.random() * 49) + 1;
        
        // Use entangled pairs if available
        if (pairs.length > 0 && Math.random() < 0.5) {
            const pairData = pairs[Math.floor(Math.random() * pairs.length)];
            const [num1, num2] = pairData.pair.split('-').map(Number);
            baseNumber = Math.random() < 0.5 ? num1 : num2;
            
            // Check entanglement with quantum
            const entanglement = this.quantum.entangleNumbers(num1, num2);
            if (entanglement.isStrong) {
                const partner = entanglement.partner;
                // Sometimes swap to partner
                if (Math.random() < 0.3) {
                    return {
                        number: partner,
                        flavor: `🦊 Loki's quantum trick! ${num1} and ${num2} are entangled! Strong entanglement! → ${partner}`,
                        color: '#51cf66'
                    };
                }
            }
        }
        
        // Apply Schrödinger's parity
        const schrodinger = this.quantum.schrodingerParity(baseNumber);
        
        // Sometimes also tunnel
        const tunnel = this.quantum.quantumTunnel(schrodinger.adjusted, 0.15);
        const finalNumber = tunnel.tunneled ? tunnel.new : schrodinger.adjusted;
        
        return {
            number: finalNumber,
            flavor: `🦊 ${schrodinger.flavor} ${tunnel.tunneled ? ' AND ' + tunnel.flavor : ''}`,
            color: '#51cf66'
        };
    }

    /**
     * Trial 5: Fenrir's Chains
     * Based on observer effect and moon phase
     */
    fenrirsChains(weather, birthdate) {
        const historyLength = this.patternAnalyzer.csvManager.history.length;
        const observerEffect = this.quantum.applyObserverEffect(historyLength);
        const moonPhase = this.astrology.getMoonPhase();
        
        // Combine weather factors
        let baseNumber = Math.floor(Math.random() * observerEffect * 25) + 1;
        const weatherFactor = (weather.humidity + weather.windSpeed) % 49 + 1;
        let finalNumber = (baseNumber + weatherFactor) % 49 + 1;
        
        // Apply quantum tunneling with higher chance
        const tunnel = this.quantum.quantumTunnel(finalNumber, 0.15);
        finalNumber = tunnel.tunneled ? tunnel.new : finalNumber;
        
        // Apply superposition
        const quantumResult = this.quantum.applySuperposition(finalNumber);
        finalNumber = quantumResult.collapsed;
        
        return {
            number: finalNumber,
            flavor: `🐺 Fenrir breaks free! ${moonPhase.emoji} ${moonPhase.name} + Observer effect ${observerEffect.toFixed(1)}! → ${finalNumber}`,
            color: '#845ef7'
        };
    }
}