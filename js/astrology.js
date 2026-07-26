/**
 * Astrology Engine - Handles zodiac signs, degrees, moon phases, and planetary data
 */

export class AstrologyEngine {
    constructor() {
        this.zodiacData = {
            aries:   { start: 321, end: 419, name: 'Aries', emoji: '♈', element: 'fire', ruling: 'mars', opposite: 'libra' },
            taurus:  { start: 420, end: 520, name: 'Taurus', emoji: '♉', element: 'earth', ruling: 'venus', opposite: 'scorpio' },
            gemini:  { start: 521, end: 620, name: 'Gemini', emoji: '♊', element: 'air', ruling: 'mercury', opposite: 'sagittarius' },
            cancer:  { start: 621, end: 722, name: 'Cancer', emoji: '♋', element: 'water', ruling: 'moon', opposite: 'capricorn' },
            leo:     { start: 723, end: 822, name: 'Leo', emoji: '♌', element: 'fire', ruling: 'sun', opposite: 'aquarius' },
            virgo:   { start: 823, end: 922, name: 'Virgo', emoji: '♍', element: 'earth', ruling: 'mercury', opposite: 'pisces' },
            libra:   { start: 923, end: 1022, name: 'Libra', emoji: '♎', element: 'air', ruling: 'venus', opposite: 'aries' },
            scorpio: { start: 1023, end: 1121, name: 'Scorpio', emoji: '♏', element: 'water', ruling: 'pluto', opposite: 'taurus' },
            sagittarius: { start: 1122, end: 1221, name: 'Sagittarius', emoji: '♐', element: 'fire', ruling: 'jupiter', opposite: 'gemini' },
            capricorn: { start: 1222, end: 119, name: 'Capricorn', emoji: '♑', element: 'earth', ruling: 'saturn', opposite: 'cancer' },
            aquarius: { start: 120, end: 218, name: 'Aquarius', emoji: '♒', element: 'air', ruling: 'uranus', opposite: 'leo' },
            pisces:  { start: 219, end: 320, name: 'Pisces', emoji: '♓', element: 'water', ruling: 'neptune', opposite: 'virgo' }
        };

        this.moonPhases = [
            { name: 'New Moon', emoji: '🌑', modifier: 7 },
            { name: 'Waxing Crescent', emoji: '🌒', modifier: 3 },
            { name: 'First Quarter', emoji: '🌓', modifier: 11 },
            { name: 'Waxing Gibbous', emoji: '🌔', modifier: 5 },
            { name: 'Full Moon', emoji: '🌕', modifier: 13 },
            { name: 'Waning Gibbous', emoji: '🌖', modifier: 5 },
            { name: 'Last Quarter', emoji: '🌗', modifier: 11 },
            { name: 'Waning Crescent', emoji: '🌘', modifier: 3 }
        ];
    }

    /**
     * Get zodiac sign from birthdate
     * @param {string} birthdate - Date in YYYY-MM-DD format
     * @returns {Object} Zodiac data
     */
    getZodiacSign(birthdate) {
        const date = new Date(birthdate);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${month}${day.toString().padStart(2, '0')}`;
        const mmdd = parseInt(month.toString().padStart(2, '0') + day.toString().padStart(2, '0'));

        for (const [id, data] of Object.entries(this.zodiacData)) {
            let start = data.start;
            let end = data.end;
            
            // Handle Capricorn wrapping around year
            if (id === 'capricorn') {
                if (mmdd >= 1222 || mmdd <= 119) {
                    return { id, ...data };
                }
            } else {
                if (mmdd >= start && mmdd <= end) {
                    return { id, ...data };
                }
            }
        }
        
        // Default to Capricorn if no match
        return { id: 'capricorn', ...this.zodiacData.capricorn };
    }

    /**
     * Get zodiac degree (0-29) within the sign
     * @param {string} birthdate - Date in YYYY-MM-DD format
     * @returns {number} Degree within sign (0-29)
     */
    getZodiacDegree(birthdate) {
        const date = new Date(birthdate);
        const zodiac = this.getZodiacSign(birthdate);
        const startDate = new Date(date.getFullYear(), 0, 0);
        const diff = date - startDate;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        // Approximate degree based on day of year within sign
        const signStartDay = this.getSignStartDay(zodiac.id, date.getFullYear());
        const dayInSign = dayOfYear - signStartDay;
        return Math.min(29, Math.max(0, dayInSign));
    }

    /**
     * Get start day of a zodiac sign
     * @param {string} signId - Zodiac ID
     * @param {number} year - Year
     * @returns {number} Day of year
     */
    getSignStartDay(signId, year) {
        const monthDay = this.zodiacData[signId]?.start || 321;
        const month = Math.floor(monthDay / 100);
        const day = monthDay % 100;
        const date = new Date(year, month - 1, day);
        const startOfYear = new Date(year, 0, 0);
        return Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
    }

    /**
     * Get current moon phase
     * @returns {Object} Moon phase data
     */
    getMoonPhase() {
        const lunarCycle = 29.53058867;
        const newMoonRef = new Date('2026-01-01');
        const daysSince = (Date.now() - newMoonRef.getTime()) / (1000 * 60 * 60 * 24);
        const phase = daysSince % lunarCycle;
        const index = Math.floor((phase / lunarCycle) * this.moonPhases.length);
        return this.moonPhases[Math.min(index, this.moonPhases.length - 1)];
    }

    /**
     * Get moon phase name
     * @returns {string} Moon phase name with emoji
     */
    getMoonPhaseName() {
        const phase = this.getMoonPhase();
        return `${phase.emoji} ${phase.name}`;
    }

    /**
     * Get moon phase modifier for calculations
     * @returns {number} Modifier value
     */
    getMoonModifier() {
        return this.getMoonPhase().modifier;
    }

    /**
     * Get retrograde status for planets
     * @returns {Object} Retrograde status
     */
    getRetrogradeStatus() {
        // Approximate retrograde periods for 2026
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();
        
        // Hardcoded approximate retrograde periods
        const retrogrades = {
            mercury: this.isInRange(month, day, [1, 2], [14, 14]) || 
                      this.isInRange(month, day, [4, 5], [7, 15]) ||
                      this.isInRange(month, day, [8, 9], [12, 4]),
            venus: this.isInRange(month, day, [2, 3], [18, 31]),
            mars: this.isInRange(month, day, [10, 11], [15, 30]),
            jupiter: this.isInRange(month, day, [5, 6], [10, 20]),
            saturn: this.isInRange(month, day, [6, 7], [15, 25])
        };

        return retrogrades;
    }

    /**
     * Check if a date is within a range
     * @param {number} month - Current month (0-11)
     * @param {number} day - Current day
     * @param {Array} start - [month, day] start
     * @param {Array} end - [month, day] end
     * @returns {boolean} True if in range
     */
    isInRange(month, day, start, end) {
        const current = month * 100 + day;
        const startVal = start[0] * 100 + start[1];
        const endVal = end[0] * 100 + end[1];
        return current >= startVal && current <= endVal;
    }

    /**
     * Get retrograde modifier for calculations
     * @returns {number} Modifier value
     */
    getRetrogradeModifier() {
        const retro = this.getRetrogradeStatus();
        let modifier = 1;
        
        if (retro.mercury) modifier += 9;
        if (retro.venus) modifier -= 4;
        if (retro.mars) modifier += 6;
        if (retro.jupiter) modifier += 2;
        if (retro.saturn) modifier += 2;
        
        return modifier;
    }

    /**
     * Get all planetary data for calculations
     * @returns {Object} Planetary data
     */
    getPlanetaryData() {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        // Approximate sun degree
        const sunDegree = dayOfYear % 360;
        
        return {
            sunDegree: sunDegree,
            dayOfYear: dayOfYear,
            moonPhase: this.getMoonPhase(),
            moonModifier: this.getMoonModifier(),
            retrogrades: this.getRetrogradeStatus(),
            retrogradeModifier: this.getRetrogradeModifier()
        };
    }

    /**
     * Get opposing sign
     * @param {string} signId - Zodiac ID
     * @returns {Object} Opposing sign data
     */
    getOpposingSign(signId) {
        const sign = this.zodiacData[signId];
        if (!sign) return null;
        const oppositeId = sign.opposite;
        return { id: oppositeId, ...this.zodiacData[oppositeId] };
    }
}