/**
 * User Manager - Handles user registration and persistence
 * Saves user data to localStorage for automatic login
 */

export class UserManager {
    constructor() {
        this.storageKey = 'norseUserData';
        this.currentUser = null;
        this.loadUser();
    }

    /**
     * Register a new user
     * @param {string} name - User's name (optional)
     * @param {string} birthdate - Date of birth (YYYY-MM-DD)
     * @param {Object} zodiacData - Zodiac information
     * @returns {Object} User object
     */
    registerUser(name, birthdate, zodiacData) {
        const user = {
            id: this.generateUserId(),
            name: name || this.generateCosmicName(),
            birthdate: birthdate,
            zodiac: zodiacData,
            registeredAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            totalRituals: 0,
            luckyNumbers: [],
            achievements: []
        };

        this.currentUser = user;
        this.saveUser();
        return user;
    }

    /**
     * Generate a unique user ID
     * @returns {string} User ID
     */
    generateUserId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `NORSE-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generate a cosmic name if user doesn't provide one
     * @returns {string} Cosmic name
     */
    generateCosmicName() {
        const prefixes = [
            'Astral', 'Cosmic', 'Nebula', 'Celestial', 'Galactic', 
            'Stellar', 'Ethereal', 'Lunar', 'Solar', 'Void',
            'Crimson', 'Golden', 'Silver', 'Bronze', 'Emerald',
            'Sapphire', 'Ruby', 'Onyx', 'Pearl', 'Amber'
        ];
        const suffixes = [
            'Walker', 'Seeker', 'Weaver', 'Dancer', 'Singer',
            'Whisperer', 'Dreamer', 'Wanderer', 'Prophet', 'Mystic',
            'Rider', 'Shifter', 'Breaker', 'Maker', 'Binder',
            'Sage', 'Warden', 'Hunter', 'Caster', 'Bringer'
        ];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${suffix}`;
    }

    /**
     * Load user from localStorage
     * @returns {Object|null} User object or null
     */
    loadUser() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.currentUser = JSON.parse(stored);
                return this.currentUser;
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
        return null;
    }

    /**
     * Save user to localStorage
     */
    saveUser() {
        try {
            if (this.currentUser) {
                localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    }

    /**
     * Update user data
     * @param {Object} updates - Fields to update
     */
    updateUser(updates) {
        if (!this.currentUser) return;
        this.currentUser = { ...this.currentUser, ...updates };
        this.currentUser.lastActive = new Date().toISOString();
        this.saveUser();
    }

    /**
     * Increment ritual count
     */
    incrementRituals() {
        if (this.currentUser) {
            this.currentUser.totalRituals = (this.currentUser.totalRituals || 0) + 1;
            this.saveUser();
        }
    }

    /**
     * Add a lucky number to user's profile
     * @param {number} number - Lucky number
     */
    addLuckyNumber(number) {
        if (!this.currentUser) return;
        if (!this.currentUser.luckyNumbers) {
            this.currentUser.luckyNumbers = [];
        }
        if (!this.currentUser.luckyNumbers.includes(number)) {
            this.currentUser.luckyNumbers.push(number);
            this.saveUser();
        }
    }

    /**
     * Add an achievement
     * @param {string} achievement - Achievement name
     */
    addAchievement(achievement) {
        if (!this.currentUser) return;
        if (!this.currentUser.achievements) {
            this.currentUser.achievements = [];
        }
        if (!this.currentUser.achievements.includes(achievement)) {
            this.currentUser.achievements.push(achievement);
            this.saveUser();
        }
    }

    /**
     * Check if user is registered
     * @returns {boolean}
     */
    isRegistered() {
        return this.currentUser !== null && this.currentUser.birthdate !== undefined;
    }

    /**
     * Get user's birthdate
     * @returns {string|null} Birthdate or null
     */
    getBirthdate() {
        return this.currentUser ? this.currentUser.birthdate : null;
    }

    /**
     * Get user's zodiac sign
     * @returns {string|null} Zodiac sign or null
     */
    getZodiacSign() {
        return this.currentUser ? this.currentUser.zodiac?.name : null;
    }

    /**
     * Clear user data (logout)
     */
    clearUser() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Get user profile for display
     * @returns {Object} Profile data
     */
    getProfile() {
        if (!this.currentUser) return null;

        return {
            id: this.currentUser.id,
            name: this.currentUser.name,
            zodiac: this.currentUser.zodiac,
            birthdate: this.currentUser.birthdate,
            registeredAt: this.currentUser.registeredAt,
            lastActive: this.currentUser.lastActive,
            totalRituals: this.currentUser.totalRituals || 0,
            luckyNumbers: this.currentUser.luckyNumbers || [],
            achievements: this.currentUser.achievements || []
        };
    }
}