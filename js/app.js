/**
 * Norse Cosmic Lottery - Main Application
 * Orchestrates the entire cosmic ritual with user management
 */

import { UserManager } from './userManager.js';
import { CSVManager } from './csvManager.js';
import { PatternAnalyzer } './patternAnalyzer.js';
import { QuantumModifier } from './quantumModifier.js';
import { AstrologyEngine } from './astrology.js';
import { TrialsEngine } from './trials.js';
import { ExtraNumberCalculator } from './extraNumber.js';
import { WeatherService } from './weather.js';
import { UIManager } from './ui.js';

class NorseLotteryApp {
    constructor() {
        // Initialize all modules
        this.userManager = new UserManager();
        this.csvManager = new CSVManager();
        this.quantum = new QuantumModifier();
        this.astrology = new AstrologyEngine();
        this.weather = new WeatherService();
        this.ui = new UIManager();
        
        // Pattern analyzer needs csvManager
        this.patternAnalyzer = new PatternAnalyzer(this.csvManager);
        
        // Trials need pattern analyzer and quantum
        this.trials = new TrialsEngine(this.patternAnalyzer, this.quantum, this.astrology);
        
        // Extra number calculator
        this.extraCalc = new ExtraNumberCalculator(this.patternAnalyzer, this.astrology);
        
        // State
        this.currentResult = null;
        this.isRunning = false;
        
        // Set UI callbacks
        this.ui.setUserCallbacks(
            (name, birthdate) => this.handleUserRegistration(name, birthdate),
            () => this.handleUserLogout()
        );
        
        // Bind UI events
        this.bindEvents();
        
        // Initialize app
        this.initialize();
        
        // Initialize tabs
        this.initTabs();
    }

    /**
     * Initialize tab navigation
     */
    initTabs() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const sections = {
            input: document.getElementById('inputSection'),
            stats: document.getElementById('statsSection'),
            results: document.getElementById('resultsSection'),
            profile: document.getElementById('profileSection')
        };

        // Hide results tab initially
        const resultsBtn = document.querySelector('.nav-btn[data-tab="results"]');
        if (resultsBtn) {
            resultsBtn.style.display = 'none';
        }

        // Tab switching function
        const switchTab = (tabId) => {
            // Update buttons
            navBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });

            // Update sections
            Object.keys(sections).forEach(key => {
                if (sections[key]) {
                    sections[key].classList.toggle('active', key === tabId);
                }
            });

            // Save current tab
            localStorage.setItem('currentTab', tabId);
        };

        // Add click listeners
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });

        // Restore last tab or default to input
        const lastTab = localStorage.getItem('currentTab') || 'input';
        switchTab(lastTab);

        // Store switchTab globally so other methods can use it
        window.switchTab = switchTab;
        window.showResultsTab = () => {
            const btn = document.querySelector('.nav-btn[data-tab="results"]');
            if (btn) {
                btn.style.display = 'flex';
                switchTab('results');
            }
        };
        
        // Store sections globally for UI manager
        window.tabSections = sections;
    }

    /**
     * Initialize app - check for existing user
     */
    initialize() {
        // Load saved data
        this.csvManager.loadFromStorage();
        
        // Check if user exists
        if (this.userManager.isRegistered()) {
            const profile = this.userManager.getProfile();
            this.ui.showUserProfile(profile);
            this.ui.showUserWelcome(profile.name, profile.zodiac?.name || '');
            
            // Auto-fill birthdate
            document.getElementById('birthdate').value = this.userManager.getBirthdate();
            
            // Load stats if history exists
            if (this.csvManager.history.length > 0) {
                this.patternAnalyzer.analyze();
                this.ui.updateStats(this.patternAnalyzer.getInsights());
                // Show stats tab but don't switch to it
                const statsSection = document.getElementById('statsSection');
                if (statsSection) {
                    statsSection.classList.add('active');
                }
            }
            
            this.ui.showToast(`👋 Welcome back, ${profile.name}!`, 'success');
        } else {
            // New user - show registration
            this.ui.showUserRegistration();
        }
    }

    /**
     * Handle user registration
     * @param {string} name - User's name
     * @param {string} birthdate - Date of birth
     */
    handleUserRegistration(name, birthdate) {
        const zodiac = this.astrology.getZodiacSign(birthdate);
        const user = this.userManager.registerUser(name, birthdate, zodiac);
        
        document.getElementById('birthdate').value = birthdate;
        
        this.ui.showUserProfile(user);
        this.ui.showUserWelcome(user.name, user.zodiac.name);
        this.ui.showToast(`🌟 Welcome, ${user.name}! Your cosmic journey begins!`, 'success');
        
        document.getElementById('ritualBtn').focus();
    }

    /**
     * Handle user logout
     */
    handleUserLogout() {
        this.csvManager.saveToStorage();
        this.userManager.clearUser();
        
        const profile = document.querySelector('.user-profile-wrapper');
        if (profile) profile.remove();
        
        const banner = document.querySelector('.welcome-banner');
        if (banner) banner.remove();
        
        this.ui.resetResults();
        
        // Switch to input tab
        if (window.switchTab) {
            window.switchTab('input');
        }
        
        document.getElementById('birthdate').value = '';
        
        this.ui.showUserRegistration();
        this.ui.showToast('👋 Logged out. See you soon!', 'info');
    }

    /**
     * Bind all DOM events
     */
    bindEvents() {
        document.getElementById('ritualBtn').addEventListener('click', () => {
            this.handleRitual();
        });

        document.getElementById('csvUpload').addEventListener('change', (e) => {
            this.handleCSVUpload(e);
        });

        document.getElementById('csvText').addEventListener('input', () => {
            const text = document.getElementById('csvText').value;
            if (text.trim()) {
                this.handleCSVPaste(text);
            }
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.handleSave();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.handleExport();
        });

        document.getElementById('newRitualBtn').addEventListener('click', () => {
            this.handleNewRitual();
        });

        document.getElementById('birthdate').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('ritualBtn').click();
            }
        });
    }

    /**
     * Handle the main ritual
     */
    async handleRitual() {
        if (this.isRunning) return;
        
        if (!this.userManager.isRegistered()) {
            this.ui.showToast('⚠️ Please register first!', 'error');
            this.ui.showUserRegistration();
            return;
        }
        
        const birthdate = this.userManager.getBirthdate() || document.getElementById('birthdate').value;
        if (!birthdate) {
            this.ui.showToast('⚠️ Please enter your date of birth!', 'error');
            return;
        }

        this.isRunning = true;
        this.ui.showLoading(true);
        document.getElementById('ritualBtn').disabled = true;

        try {
            const result = await this.performRitual(birthdate);
            this.currentResult = result;
            
            this.userManager.incrementRituals();
            await this.ui.displayResults(result);
            
            this.patternAnalyzer.analyze();
            this.ui.updateStats(this.patternAnalyzer.getInsights());
            
            if (result.duplicates && result.duplicates.length > 0) {
                this.ui.showDuplicateWarning(result.duplicates);
            } else {
                this.ui.hideDuplicateWarning();
            }

            // Show results tab with Crown Jewel
            if (window.showResultsTab) {
                window.showResultsTab();
            }

            // Update stats in background
            const statsSection = document.getElementById('statsSection');
            if (statsSection) {
                statsSection.classList.add('active');
            }
            
            this.csvManager.saveSequence(result.numbers, result.extra, {
                zodiac: result.zodiac,
                prophecy: result.prophecy,
                weather: result.weather || 'Unknown',
                moonPhase: result.moonPhase || 'Unknown'
            });

            result.numbers.forEach(num => {
                this.userManager.addLuckyNumber(num);
            });
            this.userManager.addLuckyNumber(result.extra);

            // Show toast with Crown Jewel
            this.ui.showToast(`👑 Crown Jewel: ${result.extra}!`, 'success');

        } catch (error) {
            console.error('Ritual failed:', error);
            this.ui.showToast('❌ The cosmos are confused! Please try again.', 'error');
        } finally {
            this.isRunning = false;
            this.ui.showLoading(false);
            document.getElementById('ritualBtn').disabled = false;
        }
    }

    /**
     * Perform the cosmic ritual
     * @param {string} birthdate - User's birthdate
     * @returns {Object} Result data
     */
    async performRitual(birthdate) {
        const zodiac = this.astrology.getZodiacSign(birthdate);
        const zodiacDegree = this.astrology.getZodiacDegree(birthdate);
        
        let weather = null;
        try {
            const location = await this.weather.getUserLocation();
            weather = await this.weather.fetchWeather(location.lat, location.lon);
        } catch (error) {
            console.warn('Weather data unavailable:', error);
            weather = this.weather.getFallbackWeather();
        }

        const planetaryData = this.astrology.getPlanetaryData();

        const trial1 = this.trials.rivalWrath(zodiac, planetaryData);
        const trial2 = this.trials.thorsHammer(weather);
        const trial3 = this.trials.odinsGaze(planetaryData);
        const trial4 = this.trials.lokisTrickery(weather, zodiac);
        const trial5 = this.trials.fenrirsChains(weather, birthdate);

        let mainNumbers = [
            trial1.number,
            trial2.number,
            trial3.number,
            trial4.number,
            trial5.number
        ];

        const uniqueNumbers = new Set();
        for (let i = 0; i < mainNumbers.length; i++) {
            let attempts = 0;
            while (uniqueNumbers.has(mainNumbers[i]) && attempts < 50) {
                const suggestions = this.patternAnalyzer.getSuggestions(1);
                mainNumbers[i] = suggestions[0] || Math.floor(Math.random() * 49) + 1;
                attempts++;
            }
            uniqueNumbers.add(mainNumbers[i]);
        }

        let extra = this.extraCalc.calculate(zodiacDegree, planetaryData);
        let extraAttempts = 0;
        while (mainNumbers.includes(extra.number) && extraAttempts < 50) {
            extra.number = (extra.number % 49) + 1;
            extraAttempts++;
        }

        const duplicates = this.checkDuplicates(mainNumbers, extra.number);
        const prophecy = this.generateProphecy(mainNumbers, duplicates);

        return {
            numbers: mainNumbers,
            extra: extra.number,
            flavors: [trial1.flavor, trial2.flavor, trial3.flavor, trial4.flavor, trial5.flavor],
            colors: [trial1.color, trial2.color, trial3.color, trial4.color, trial5.color],
            extraFlavor: extra.flavor,
            extraFactors: extra.factors,
            prophecy: prophecy,
            zodiac: zodiac.name,
            weather: weather ? `${weather.temperature}°C ${weather.conditions || ''}` : 'Unknown',
            moonPhase: this.astrology.getMoonPhaseName(),
            duplicates: duplicates,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Check for duplicate numbers in history
     * @param {Array} mainNumbers - Main numbers
     * @param {number} extra - Extra number
     * @returns {Array} Duplicate entries
     */
    checkDuplicates(mainNumbers, extra) {
        const allHistory = this.csvManager.history;
        const duplicates = [];
        const allNumbers = [...mainNumbers, extra];

        allHistory.forEach(entry => {
            const nums = entry.numbers.split(',').map(Number);
            const match = nums.filter(n => allNumbers.includes(n));
            if (match.length > 0) {
                duplicates.push({
                    date: entry.timestamp,
                    matchingNumbers: match,
                    count: match.length
                });
            }
        });

        return duplicates;
    }

    /**
     * Generate prophecy based on numbers
     * @param {Array} numbers - Main numbers
     * @param {Array} duplicates - Duplicate entries
     * @returns {string} Prophecy text
     */
    generateProphecy(numbers, duplicates) {
        const evenCount = numbers.filter(n => n % 2 === 0).length;
        const highCount = numbers.filter(n => n > 25).length;
        const duplicatesFound = duplicates.length > 0;
        const sum = numbers.reduce((a, b) => a + b, 0);
        
        let prophecy = '';
        
        if (duplicatesFound) {
            prophecy = '⚠️ WARNING: These numbers echo through your history! The universe repeats itself...';
        } else if (evenCount >= 4) {
            prophecy = '🌀 The balance of yin and yang shifts! Even numbers dominate! Loki approves!';
        } else if (highCount >= 4) {
            prophecy = '🌌 You reach for the stars! High numbers bring cosmic energy!';
        } else if (evenCount === 0) {
            prophecy = '🔥 FIRE AND FURY! All odd numbers! Thor blesses your rage!';
        } else if (sum > 150) {
            prophecy = '⚡ The weight of your destiny is heavy! High sum numbers carry great power!';
        } else if (sum < 80) {
            prophecy = '🌙 Humble beginnings lead to great fortune! Low numbers are a blessing!';
        } else {
            prophecy = '⚖️ Perfect balance! The cosmos aligns with your fate!';
        }
        
        const insights = this.patternAnalyzer.getInsights();
        if (insights.totalDraws > 0) {
            prophecy += ` (Based on ${insights.totalDraws} historical draws. Hot: ${insights.hotNumbers?.slice(0, 3).join(', ') || 'none'})`;
        }
        
        return prophecy;
    }

    /**
     * Handle CSV upload
     * @param {Event} event - File upload event
     */
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.processCSVData(text);
            document.getElementById('fileName').textContent = file.name;
        };
        reader.readAsText(file);
    }

    /**
     * Handle CSV paste
     * @param {string} text - CSV text
     */
    handleCSVPaste(text) {
        this.processCSVData(text);
        document.getElementById('fileName').textContent = 'Pasted data';
    }

    /**
     * Process CSV data
     * @param {string} text - CSV text
     */
    processCSVData(text) {
        try {
            const data = this.csvManager.parseCSV(text);
            this.patternAnalyzer.analyze();
            this.ui.showCSVPreview(data);
            this.ui.updateStats(this.patternAnalyzer.getInsights());
            this.ui.showToast(`✅ Loaded ${data.length} historical draws!`, 'success');
            
            // Switch to stats tab
            if (window.switchTab) {
                window.switchTab('stats');
            }
        } catch (error) {
            console.error('CSV parsing failed:', error);
            this.ui.showToast('❌ Invalid CSV format! Please check your data.', 'error');
        }
    }

    /**
     * Handle save action
     */
    handleSave() {
        if (!this.currentResult) {
            this.ui.showToast('⚠️ No results to save!', 'error');
            return;
        }
        this.ui.showToast('💾 Results saved to history!', 'success');
    }

    /**
     * Handle export action
     */
    handleExport() {
        const csv = this.csvManager.exportCSV();
        if (!csv) {
            this.ui.showToast('⚠️ No history to export!', 'error');
            return;
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.getElementById('downloadLink');
        link.href = url;
        link.download = `norse-lottery-history-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.ui.showToast('📥 History exported successfully!', 'success');
    }

    /**
     * Handle new ritual action
     */
    handleNewRitual() {
        this.currentResult = null;
        this.ui.resetResults();
        
        // Switch to input tab
        if (window.switchTab) {
            window.switchTab('input');
        }
        
        document.getElementById('birthdate').focus();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NorseLotteryApp();
});