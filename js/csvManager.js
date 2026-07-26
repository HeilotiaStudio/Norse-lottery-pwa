/**
 * CSV Manager - Handles all CSV operations
 * Parsing, saving, loading, and exporting lottery data
 */

export class CSVManager {
    constructor() {
        this.history = [];
        this.uploadedData = [];
        this.storageKey = 'norseLotteryData';
    }

    /**
     * Parse CSV text into array of objects
     * @param {string} csvText - CSV content
     * @returns {Array} Parsed data
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] ? values[index].trim() : '';
            });
            data.push(entry);
        }

        this.uploadedData = data;
        this.saveToStorage();
        return data;
    }

    /**
     * Parse a CSV line handling quoted values
     * @param {string} line - CSV line
     * @returns {Array} Parsed values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        
        return result;
    }

    /**
     * Save a generated sequence to history
     * @param {Array} numbers - Main numbers
     * @param {number} extra - Extra number
     * @param {Object} metadata - Additional data
     * @returns {Object} Saved entry
     */
    saveSequence(numbers, extra, metadata) {
        const entry = {
            timestamp: new Date().toISOString(),
            numbers: numbers.join(','),
            extra: extra,
            zodiac: metadata.zodiac || 'Unknown',
            prophecy: metadata.prophecy || '',
            weather: metadata.weather || 'Unknown',
            moonPhase: metadata.moonPhase || 'Unknown',
            ...metadata
        };

        this.history.push(entry);
        this.saveToStorage();
        return entry;
    }

    /**
     * Get all numbers from history (main + extra)
     * @returns {Array} All numbers
     */
    getAllNumbers() {
        const all = [];
        this.history.forEach(entry => {
            if (entry.numbers) {
                const nums = entry.numbers.split(',').map(Number);
                all.push(...nums);
            }
            if (entry.extra) {
                all.push(Number(entry.extra));
            }
        });
        return all;
    }

    /**
     * Get all sequences from history
     * @returns {Array} All sequences as arrays
     */
    getAllSequences() {
        return this.history.map(entry => {
            const nums = entry.numbers ? entry.numbers.split(',').map(Number) : [];
            if (entry.extra) {
                nums.push(Number(entry.extra));
            }
            return nums;
        });
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                history: this.history,
                uploaded: this.uploadedData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.history = data.history || [];
                this.uploadedData = data.uploaded || [];
                return true;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        return false;
    }

    /**
     * Clear all data
     */
    clearAll() {
        this.history = [];
        this.uploadedData = [];
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Export history as CSV
     * @returns {string} CSV content
     */
    exportCSV() {
        if (this.history.length === 0) return '';

        const headers = Object.keys(this.history[0]);
        let csv = headers.join(',') + '\n';

        this.history.forEach(entry => {
            const row = headers.map(h => {
                const value = entry[h] || '';
                if (value.includes(',') || value.includes('"')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
            csv += row + '\n';
        });

        return csv;
    }

    /**
     * Get history length
     * @returns {number}
     */
    getHistoryCount() {
        return this.history.length;
    }

    /**
     * Get uploaded data count
     * @returns {number}
     */
    getUploadedCount() {
        return this.uploadedData.length;
    }

    /**
     * Check if number exists in history
     * @param {number} number - Number to check
     * @returns {boolean}
     */
    numberExists(number) {
        const all = this.getAllNumbers();
        return all.includes(number);
    }

    /**
     * Get frequency of a number in history
     * @param {number} number - Number to check
     * @returns {number}
     */
    getNumberFrequency(number) {
        const all = this.getAllNumbers();
        return all.filter(n => n === number).length;
    }
}