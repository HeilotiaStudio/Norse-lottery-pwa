/**
 * Norse Cosmic Lottery - Main Application
 * Orchestrates the entire cosmic ritual with user management
 * Auto-saves to CSV and checks for duplicates
 */

import { UserManager } from './userManager.js';
import { CSVManager } from './csvManager.js';
import { PatternAnalyzer } from './patternAnalyzer.js';
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
        
        // Initialize tabs first so window.switchTab is available
        this.initTabs();
        
        // Bind UI events
        this.bindEvents();
        
        // Initialize app
        this.initialize();
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
            // Update nav buttons
            navBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });

            // Update content sections
            Object.keys(sections).forEach(key => {
                if (sections[key]) {
                    sections[key].classList.toggle('active', key === tabId);
                }
            });

            // Save current tab
            localStorage.setItem('currentTab', tabId);
        };

        // Add click listeners to nav buttons
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.dataset.tab;
                if (tabId) {
                    switchTab(tabId);
                }
            });
        });

        // Restore last tab or default to input
        // Don't restore 'results' tab on fresh load — it requires a ritual to be run
        const lastTab = localStorage.getItem('currentTab') || 'input';
        switchTab(lastTab === 'results' ? 'input' : lastTab);

        // Expose globally
        window.switchTab = switchTab;
        window.showResultsTab = () => {
            const btn = document.querySelector('.nav-btn[data-tab="results"]');
            if (btn) {
                btn.style.display = 'flex';
                switchTab('results');
            }
        };
        
        window.tabSections = sections;
        
        console.log('✅ Tabs initialized!');
    }

    /**
     * Initialize app - check for existing user
     */
    initialize() {
        this.csvManager.loadFromStorage();
        
        if (this.userManager.isRegistered()) {
            const profile = this.userManager.getProfile();
            this.ui.showUserProfile(profile);
            this.ui.showUserWelcome(profile.name, profile.zodiac?.name || '');
            
            document.getElementById('birthdate').value = this.userManager.getBirthdate();
            
            if (this.csvManager.history.length > 0) {
                this.patternAnalyzer.analyze();
                this.ui.updateStats(this.patternAnalyzer.getInsights());
                this.autoExportCSV();
            }
            
            this.ui.showToast(`👋 Welcome back, ${profile.name}!`, 'success');
        } else {
            this.ui.showUserRegistration();
        }
    }

    /**
     * Handle user registration
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
        this.autoExportCSV();
        this.userManager.clearUser();
        
        const profile = document.querySelector('.user-profile-wrapper');
        if (profile) profile.remove();
        
        const banner = document.querySelector('.welcome-banner');
        if (banner) banner.remove();
        
        this.ui.resetResults();
        
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

        document.getElementById('resultsRitualBtn').addEventListener('click', () => {
            if (window.switchTab) window.switchTab('input');
        });

        document.getElementById('birthdate').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('ritualBtn').click();
            }
        });

        // Profile register button
        const profileRegisterBtn = document.getElementById('profileRegisterBtn');
        if (profileRegisterBtn) {
            profileRegisterBtn.addEventListener('click', () => {
                this.ui.showUserRegistration();
            });
        }
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
            
            // Check for duplicate sequence
            const isDuplicate = this.checkDuplicateSequence(result.numbers, result.extra);
            
            if (isDuplicate) {
                this.ui.showToast('⚠️ DUPLICATE SEQUENCE DETECTED! These exact numbers appeared before!', 'warning');
                this.ui.showDuplicateWarning([{
                    date: 'Previous draw',
                    matchingNumbers: result.numbers,
                    count: result.numbers.length
                }]);
            } else {
                this.ui.hideDuplicateWarning();
                this.ui.showToast(`✅ New sequence saved! Crown Jewel: ${result.extra}`, 'success');
            }
            
            // Auto-save to CSV
            this.autoExportCSV();
            
            // Show results tab
            if (window.showResultsTab) {
                window.showResultsTab();
            }

            // Save to history
            this.csvManager.saveSequence(result.numbers, result.extra, {
                zodiac: result.zodiac,
                prophecy: result.prophecy,
                weather: result.weather || 'Unknown',
                moonPhase: result.moonPhase || 'Unknown',
                isDuplicate: isDuplicate
            });

            result.numbers.forEach(num => {
                this.userManager.addLuckyNumber(num);
            });
            this.userManager.addLuckyNumber(result.extra);

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
     * Check if a sequence already exists in history
     */
    checkDuplicateSequence(numbers, extra) {
        const history = this.csvManager.history;
        const sortedNew = [...numbers].sort((a, b) => a - b);
        
        for (const entry of history) {
            if (!entry.numbers) continue;
            const existingNumbers = entry.numbers.split(',').map(Number).sort((a, b) => a - b);
            const existingExtra = Number(entry.extra);
            
            const numbersMatch = sortedNew.every((num, i) => num === existingNumbers[i]);
            const extraMatch = extra === existingExtra;
            
            if (numbersMatch && extraMatch) {
                return true;
            }
        }
        return false;
    }

    /**
     * Auto-export to CSV - FIXED
     */
    autoExportCSV() {
        const history = this.csvManager.history;
        if (history.length === 0) return;
        
        const headers = ['numbers', 'extra', 'timestamp', 'zodiac', 'prophecy', 'weather', 'moonPhase'];
        let csv = headers.join(',') + '\n';

        history.forEach(entry => {
            const row = headers.map(h => {
                let value = entry[h];
                if (value === undefined || value === null) {
                    value = '';
                } else {
                    value = String(value);
                }
                if (value.includes(',') || value.includes('"')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
            csv += row + '\n';
        });

        localStorage.setItem('numbersCSV', csv);
        localStorage.setItem('lastAutoSave', new Date().toISOString());
        this.ui.updateHistoryTable();
    }

    /**
     * Perform the cosmic ritual
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
     */
    handleCSVPaste(text) {
        this.processCSVData(text);
        document.getElementById('fileName').textContent = 'Pasted data';
    }

    /**
     * Process CSV data
     */
    processCSVData(text) {
        try {
            const data = this.csvManager.parseCSV(text);
            this.patternAnalyzer.analyze();
            this.ui.showCSVPreview(data);
            this.ui.updateStats(this.patternAnalyzer.getInsights());
            this.ui.showToast(`✅ Loaded ${data.length} historical draws!`, 'success');
            this.autoExportCSV();
            
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
        
        this.autoExportCSV();
        this.ui.showToast('💾 Results saved to history and CSV!', 'success');
    }

    /**
     * Handle export action - download CSV
     */
    handleExport() {
        const csv = localStorage.getItem('numbersCSV');
        if (!csv) {
            this.ui.showToast('⚠️ No history to export!', 'error');
            return;
        }

        const date = new Date().toISOString().split('T')[0];
        const filename = `numbers-${date}.csv`;
        
        this.ui.downloadCSV(csv, filename);
    }

    /**
     * Handle new ritual action
     */
    handleNewRitual() {
        this.currentResult = null;
        this.ui.resetResults();
        
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