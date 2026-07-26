/**
 * Pattern Analyzer - Statistical analysis of lottery data
 * Finds hot/cold numbers, pairs, gaps, and other patterns
 */

export class PatternAnalyzer {
    constructor(csvManager) {
        this.csvManager = csvManager;
        this.frequency = {};
        this.hotNumbers = [];
        this.coldNumbers = [];
        this.repeatingPairs = {};
        this.gaps = {};
        this.lastSeen = {};
        this.insights = {};
        this.analyzed = false;
    }

    /**
     * Run full analysis on all data
     */
    analyze() {
        const allNumbers = this.csvManager.getAllNumbers();
        const history = this.csvManager.history;
        
        if (allNumbers.length === 0) {
            this.analyzed = false;
            return;
        }

        // 1. Frequency analysis
        this.frequency = {};
        allNumbers.forEach(num => {
            this.frequency[num] = (this.frequency[num] || 0) + 1;
        });

        // 2. Sort by frequency
        const sorted = Object.entries(this.frequency)
            .sort((a, b) => b[1] - a[1])
            .map(entry => Number(entry[0]));

        // 3. Hot numbers (top 10)
        this.hotNumbers = sorted.slice(0, 10);

        // 4. Cold numbers (bottom 10 or never seen)
        const allPossible = Array.from({length: 49}, (_, i) => i + 1);
        const seen = new Set(allNumbers);
        const neverSeen = allPossible.filter(n => !seen.has(n));
        
        const seenWithFreq = allPossible
            .filter(n => seen.has(n))
            .map(n => ({ number: n, freq: this.frequency[n] || 0 }))
            .sort((a, b) => a.freq - b.freq);

        const lowestSeen = seenWithFreq.slice(0, 5).map(item => item.number);
        this.coldNumbers = [...lowestSeen, ...neverSeen].slice(0, 10);

        // 5. Repeating pairs
        this.repeatingPairs = {};
        history.forEach(entry => {
            if (!entry.numbers) return;
            const nums = entry.numbers.split(',').map(Number);
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const pair = [nums[i], nums[j]].sort((a, b) => a - b).join('-');
                    this.repeatingPairs[pair] = (this.repeatingPairs[pair] || 0) + 1;
                }
            }
        });

        // 6. Gap analysis
        this.gaps = {};
        this.lastSeen = {};
        history.forEach((entry, index) => {
            if (!entry.numbers) return;
            const nums = entry.numbers.split(',').map(Number);
            nums.forEach(num => {
                if (this.lastSeen[num] !== undefined) {
                    const gap = index - this.lastSeen[num];
                    if (!this.gaps[num]) this.gaps[num] = [];
                    this.gaps[num].push(gap);
                }
                this.lastSeen[num] = index;
            });
        });

        // 7. Calculate insights
        this.insights = this.calculateInsights();
        this.analyzed = true;
    }

    /**
     * Calculate summary insights
     * @returns {Object} Insights object
     */
    calculateInsights() {
        const totalDraws = this.csvManager.history.length;
        const allNumbers = this.csvManager.getAllNumbers();
        const uniqueCount = Object.keys(this.frequency).length;
        const avgPerNumber = totalDraws > 0 ? (allNumbers.length / 49) : 0;

        let mostFrequentPair = null;
        let maxPairFreq = 0;
        for (const [pair, freq] of Object.entries(this.repeatingPairs)) {
            if (freq > maxPairFreq) {
                maxPairFreq = freq;
                mostFrequentPair = pair;
            }
        }

        let avgGap = 0;
        let gapCount = 0;
        for (const [num, gaps] of Object.entries(this.gaps)) {
            const sum = gaps.reduce((a, b) => a + b, 0);
            avgGap += sum;
            gapCount += gaps.length;
        }
        avgGap = gapCount > 0 ? avgGap / gapCount : 0;

        return {
            totalDraws,
            totalNumbers: allNumbers.length,
            uniqueNumbers: uniqueCount,
            coverage: (uniqueCount / 49 * 100).toFixed(1),
            averageFrequency: avgPerNumber.toFixed(2),
            averageGap: avgGap.toFixed(1),
            mostFrequentPair: mostFrequentPair,
            pairFrequency: maxPairFreq,
            hotNumbers: this.hotNumbers.slice(0, 5),
            coldNumbers: this.coldNumbers.slice(0, 5)
        };
    }

    /**
     * Get weighted suggestions based on patterns
     * @param {number} count - Number of suggestions
     * @returns {Array} Suggested numbers
     */
    getSuggestions(count = 5) {
        if (!this.analyzed || this.hotNumbers.length === 0) {
            return this.getRandomNumbers(count);
        }

        const suggestions = new Set();
        const pools = {
            hot: this.hotNumbers.slice(0, 5),
            cold: this.coldNumbers.slice(0, 5),
            due: this.getDueNumbers(5)
        };

        const weights = { hot: 0.4, cold: 0.3, due: 0.3 };

        while (suggestions.size < count) {
            const rand = Math.random();
            let pool;
            if (rand < weights.hot) {
                pool = pools.hot;
            } else if (rand < weights.hot + weights.cold) {
                pool = pools.cold;
            } else {
                pool = pools.due;
            }

            if (pool.length > 0) {
                const num = pool[Math.floor(Math.random() * pool.length)];
                if (!suggestions.has(num)) {
                    suggestions.add(num);
                }
            } else {
                const num = Math.floor(Math.random() * 49) + 1;
                if (!suggestions.has(num)) {
                    suggestions.add(num);
                }
            }
        }

        return Array.from(suggestions);
    }

    /**
     * Get numbers that are "due" (largest gaps)
     * @param {number} count - Number to return
     * @returns {Array} Due numbers
     */
    getDueNumbers(count = 5) {
        const due = Object.entries(this.gaps)
            .filter(([num, gaps]) => gaps.length > 0)
            .map(([num, gaps]) => {
                const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
                const lastGap = gaps[gaps.length - 1] || 0;
                return {
                    number: Number(num),
                    avgGap,
                    lastGap,
                    score: lastGap / (avgGap + 1)
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(item => item.number);

        while (due.length < count) {
            const cold = this.coldNumbers[Math.floor(Math.random() * this.coldNumbers.length)];
            if (cold && !due.includes(cold)) {
                due.push(cold);
            } else {
                break;
            }
        }

        return due;
    }

    /**
     * Get random numbers
     * @param {number} count - Number to return
     * @returns {Array} Random numbers
     */
    getRandomNumbers(count = 5) {
        const numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * 49) + 1);
        }
        return Array.from(numbers);
    }

    /**
     * Get full insights
     * @returns {Object} Insights
     */
    getInsights() {
        if (!this.analyzed) {
            this.analyze();
        }
        return this.insights;
    }

    /**
     * Get hot numbers
     * @param {number} limit - Max number to return
     * @returns {Array} Hot numbers
     */
    getHotNumbers(limit = 5) {
        return this.hotNumbers.slice(0, limit);
    }

    /**
     * Get cold numbers
     * @param {number} limit - Max number to return
     * @returns {Array} Cold numbers
     */
    getColdNumbers(limit = 5) {
        return this.coldNumbers.slice(0, limit);
    }

    /**
     * Check if a number is hot
     * @param {number} number - Number to check
     * @returns {boolean}
     */
    isHot(number) {
        return this.hotNumbers.includes(number);
    }

    /**
     * Check if a number is cold
     * @param {number} number - Number to check
     * @returns {boolean}
     */
    isCold(number) {
        return this.coldNumbers.includes(number);
    }

    /**
     * Get frequency of a number
     * @param {number} number - Number to check
     * @returns {number}
     */
    getFrequency(number) {
        return this.frequency[number] || 0;
    }

    /**
     * Get all pairs sorted by frequency
     * @param {number} limit - Max number to return
     * @returns {Array} Pairs
     */
    getTopPairs(limit = 10) {
        return Object.entries(this.repeatingPairs)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([pair, freq]) => ({ pair, freq }));
    }

    /**
     * Get gap history for a number
     * @param {number} number - Number to check
     * @returns {Array} Gap history
     */
    getGapHistory(number) {
        return this.gaps[number] || [];
    }
}