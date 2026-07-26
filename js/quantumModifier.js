/**
 * Quantum Modifier - Adds quantum mechanics flavor to numbers
 * Superposition, entanglement, tunneling, and observer effect
 */

export class QuantumModifier {
    constructor() {
        this.superposition = [];
        this.entanglement = {};
        this.observerEffect = 0;
        this.quantumDecoherence = 0;
    }

    /**
     * Apply quantum superposition to a number
     * @param {number} baseNumber - Original number
     * @param {number} spread - How far variants go
     * @returns {Object} Result with collapsed number
     */
    applySuperposition(baseNumber, spread = 5) {
        const variants = [];
        for (let i = -spread; i <= spread; i++) {
            const variant = baseNumber + i;
            if (variant >= 1 && variant <= 49) {
                variants.push(variant);
            }
        }

        const weights = variants.map((v) => {
            const distance = Math.abs(v - baseNumber);
            return Math.exp(-distance / (spread / 2));
        });

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let collapsed = variants[0];

        for (let i = 0; i < variants.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                collapsed = variants[i];
                break;
            }
        }

        const result = {
            original: baseNumber,
            variants: variants,
            collapsed: collapsed,
            observerEffect: this.observerEffect,
            decoherence: this.quantumDecoherence
        };

        this.superposition.push(result);
        return result;
    }

    /**
     * Apply quantum entanglement between two numbers
     * @param {number} num1 - First number
     * @param {number} num2 - Second number
     * @returns {Object} Entanglement result
     */
    entangleNumbers(num1, num2) {
        const key = [num1, num2].sort((a, b) => a - b).join('-');
        this.entanglement[key] = (this.entanglement[key] || 0) + 1;

        const strength = this.entanglement[key];
        const isStrong = strength > 2;

        return {
            entangled: true,
            strength: strength,
            isStrong: isStrong,
            key: key,
            partner: num2,
            flavor: isStrong 
                ? `⚛️ Strong entanglement! These numbers are quantum linked!`
                : `⚛️ Weak entanglement detected.`
        };
    }

    /**
     * Check if two numbers are entangled
     * @param {number} num1 - First number
     * @param {number} num2 - Second number
     * @returns {Object} Entanglement info
     */
    checkEntanglement(num1, num2) {
        const key1 = [num1, num2].sort((a, b) => a - b).join('-');
        const key2 = [num2, num1].sort((a, b) => a - b).join('-');
        
        const strength = this.entanglement[key1] || this.entanglement[key2] || 0;
        
        return {
            entangled: strength > 0,
            strength: strength,
            isStrong: strength > 2
        };
    }

    /**
     * Apply quantum tunneling effect
     * @param {number} number - Original number
     * @param {number} tunnelChance - Probability of tunneling (0-1)
     * @returns {Object} Tunneling result
     */
    quantumTunnel(number, tunnelChance = 0.1) {
        if (Math.random() < tunnelChance) {
            let newNum;
            do {
                newNum = Math.floor(Math.random() * 49) + 1;
            } while (newNum === number);

            return {
                tunneled: true,
                original: number,
                new: newNum,
                flavor: `⚛️ Quantum tunneling! ${number} phased through reality to ${newNum}!`
            };
        }

        return {
            tunneled: false,
            original: number,
            new: number,
            flavor: '⚛️ Quantum tunneling failed. Reality remains stable.'
        };
    }

    /**
     * Apply Schrödinger's parity (both even and odd until observed)
     * @param {number} number - Original number
     * @returns {Object} Result with observed parity
     */
    schrodingerParity(number) {
        const observedParity = Math.random() < 0.5 ? 'even' : 'odd';
        let adjusted = number;

        if (observedParity === 'even' && number % 2 !== 0) {
            adjusted = number + 1;
        } else if (observedParity === 'odd' && number % 2 === 0) {
            adjusted = number - 1;
        }

        if (adjusted < 1) adjusted = 2;
        if (adjusted > 49) adjusted = 48;

        return {
            original: number,
            observedParity: observedParity,
            adjusted: adjusted,
            flavor: `🐱 Schrödinger's parity: ${number} was both even and odd until observed! Collapsed to ${observedParity} → ${adjusted}`
        };
    }

    /**
     * Apply observer effect based on history length
     * @param {number} historyLength - Number of past draws
     * @returns {number} Observer effect strength
     */
    applyObserverEffect(historyLength) {
        if (historyLength < 5) {
            this.observerEffect = 0.3;
        } else if (historyLength < 20) {
            this.observerEffect = 0.7;
        } else if (historyLength < 50) {
            this.observerEffect = 1.2;
        } else {
            this.observerEffect = 2.0;
        }

        this.quantumDecoherence = (Math.random() - 0.5) * this.observerEffect * 0.3;
        return this.observerEffect;
    }

    /**
     * Quantum fluctuation - random number influenced by quantum effects
     * @param {number} baseNumber - Base number
     * @param {number} intensity - How strong the fluctuation
     * @returns {Object} Fluctuation result
     */
    quantumFluctuation(baseNumber, intensity = 1) {
        const fluctuation = (Math.random() - 0.5) * intensity * 5;
        let result = Math.round(baseNumber + fluctuation);
        result = Math.max(1, Math.min(49, result));

        return {
            original: baseNumber,
            fluctuation: fluctuation,
            result: result,
            intensity: intensity,
            flavor: `⚛️ Quantum fluctuation of ${fluctuation.toFixed(2)} changed ${baseNumber} → ${result}`
        };
    }

    /**
     * Quantum coherence - all numbers act together
     * @param {Array} numbers - Array of numbers
     * @param {number} coherenceStrength - Strength of coherence
     * @returns {Object} Coherence result
     */
    quantumCoherence(numbers, coherenceStrength = 1) {
        const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const shifted = numbers.map(n => {
            const shift = (n - average) * coherenceStrength * 0.1;
            let result = Math.round(n + shift);
            result = Math.max(1, Math.min(49, result));
            return result;
        });

        return {
            original: numbers,
            shifted: shifted,
            average: average,
            coherenceStrength: coherenceStrength,
            flavor: `⚛️ Quantum coherence! Numbers aligned to ${average.toFixed(1)}`
        };
    }
}