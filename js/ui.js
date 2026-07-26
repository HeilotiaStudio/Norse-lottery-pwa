/**
 * UI Manager - Handles all DOM updates and animations
 * Updated with CSV export, history table, and tab navigation
 */

export class UIManager {
    constructor() {
        this.sections = {
            input: document.getElementById('inputSection'),
            stats: document.getElementById('statsSection'),
            results: document.getElementById('resultsSection'),
            profile: document.getElementById('profileSection')
        };
        
        this.toastTimeout = null;
        this.revealTimers = [];
        this.onRegister = null;
        this.onLogout = null;
    }

    // ==========================================
    // USER MANAGEMENT UI
    // ==========================================

    /**
     * Show user registration prompt
     */
    showUserRegistration() {
        if (document.getElementById('userRegistrationModal')) return;

        const modal = document.createElement('div');
        modal.id = 'userRegistrationModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content cosmic-modal">
                <div class="modal-header">
                    <span class="modal-icon">🌌</span>
                    <h2>Welcome, Seeker of Fate!</h2>
                </div>
                <div class="modal-body">
                    <p>Enter your details to begin your cosmic journey.</p>
                    
                    <div class="input-group">
                        <label for="userName">Your Name (optional)</label>
                        <input type="text" id="userName" class="cosmic-input" 
                               placeholder="Enter your name or leave blank for cosmic name">
                    </div>
                    
                    <div class="input-group">
                        <label for="userBirthdate">📅 Date of Birth</label>
                        <input type="date" id="userBirthdate" class="cosmic-input" required>
                    </div>
                    
                    <div class="modal-actions">
                        <button id="registerBtn" class="ritual-button">
                            ⚡ Begin Your Journey ⚡
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            document.getElementById('userBirthdate').focus();
        }, 300);

        document.getElementById('registerBtn').addEventListener('click', () => {
            const name = document.getElementById('userName').value.trim() || null;
            const birthdate = document.getElementById('userBirthdate').value;
            
            if (!birthdate) {
                this.showToast('⚠️ Please enter your date of birth!', 'error');
                return;
            }

            if (this.onRegister) {
                this.onRegister(name, birthdate);
            }
            this.closeModal('userRegistrationModal');
        });

        document.getElementById('userBirthdate').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('registerBtn').click();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (!document.getElementById('userBirthdate').value) {
                    this.showToast('⚠️ Please enter your birthdate to continue', 'warning');
                }
            }
        });
    }

    /**
     * Show user profile
     * @param {Object} profile - User profile data
     */
    showUserProfile(profile) {
        if (!profile) return;

        const profileHTML = `
            <div class="user-profile">
                <div class="profile-header">
                    <span class="profile-avatar">${profile.zodiac?.emoji || '🌟'}</span>
                    <div class="profile-info">
                        <h3>${profile.name}</h3>
                        <span class="profile-id">${profile.id}</span>
                    </div>
                </div>
                <div class="profile-details">
                    <div class="profile-stat">
                        <span class="stat-label">♈ Sign</span>
                        <span class="stat-value">${profile.zodiac?.name || 'Unknown'}</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-label">📅 Born</span>
                        <span class="stat-value">${profile.birthdate}</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-label">🔮 Rituals</span>
                        <span class="stat-value">${profile.totalRituals}</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-label">🍀 Lucky Numbers</span>
                        <span class="stat-value">${profile.luckyNumbers?.join(', ') || 'None yet'}</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button id="logoutBtn" class="action-button secondary">🚪 Logout</button>
                </div>
            </div>
        `;

        const inputContainer = document.querySelector('.input-container');
        const existingProfile = document.querySelector('.user-profile-wrapper');
        if (existingProfile) {
            existingProfile.remove();
        }
        
        const profileElement = document.createElement('div');
        profileElement.className = 'user-profile-wrapper';
        profileElement.innerHTML = profileHTML;
        inputContainer.prepend(profileElement);

        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout? Your history will be saved.')) {
                if (this.onLogout) {
                    this.onLogout();
                }
            }
        });
    }

    /**
     * Show user welcome banner
     * @param {string} name - User's name
     * @param {string} zodiac - Zodiac sign
     */
    showUserWelcome(name, zodiac) {
        const banner = document.createElement('div');
        banner.className = 'welcome-banner';
        banner.innerHTML = `
            <span class="welcome-emoji">👋</span>
            <span class="welcome-text">Welcome back, <strong>${name}</strong>! <span class="zodiac-badge">${zodiac}</span></span>
        `;
        
        const header = document.querySelector('.header');
        const existing = document.querySelector('.welcome-banner');
        if (existing) existing.remove();
        header.after(banner);
    }

    // ==========================================
    // CORE UI METHODS
    // ==========================================

    /**
     * Show loading state
     * @param {boolean} show - Show or hide
     */
    showLoading(show) {
        const loading = document.getElementById('loadingIndicator');
        const btn = document.getElementById('ritualBtn');
        
        if (show) {
            loading.style.display = 'block';
            btn.style.display = 'none';
        } else {
            loading.style.display = 'none';
            btn.style.display = 'block';
        }
    }

    /**
     * Show a specific section using tabs
     * @param {string} section - Section name ('input', 'stats', 'results', 'profile')
     */
    showSection(section) {
        if (window.switchTab) {
            window.switchTab(section);
        } else {
            // Fallback for backwards compatibility
            Object.keys(this.sections).forEach(key => {
                if (this.sections[key]) {
                    this.sections[key].classList.toggle('active', key === section);
                }
            });
        }
    }

    /**
     * Show input section
     */
    showInputSection() {
        if (window.switchTab) {
            window.switchTab('input');
        }
    }

    /**
     * Show stats section
     */
    showStatsSection() {
        if (window.switchTab) {
            window.switchTab('stats');
        }
    }

    /**
     * Show results section
     */
    showResultsSection() {
        if (window.showResultsTab) {
            window.showResultsTab();
        } else {
            this.showSection('results');
        }
    }

    /**
     * Show profile section
     */
    showProfileSection() {
        if (window.switchTab) {
            window.switchTab('profile');
        }
    }

    /**
     * Display results with dramatic reveal
     * @param {Object} result - Result data
     */
    async displayResults(result) {
        this.showResultsSection();

        const circles = document.querySelectorAll('.number-circle');
        const flavors = document.querySelectorAll('.number-flavor');
        const colors = ['fire', 'ice', 'gold', 'green', 'purple'];

        circles.forEach(circle => {
            circle.textContent = '?';
            circle.className = 'number-circle';
        });

        for (let i = 0; i < 5; i++) {
            await this.delay(600 + i * 300);
            
            const circle = circles[i];
            const flavor = flavors[i];
            
            circle.textContent = result.numbers[i];
            circle.classList.add('reveal');
            circle.classList.add(`glow-${colors[i]}`);
            
            if (flavor && result.flavors[i]) {
                flavor.textContent = result.flavors[i];
            }
        }

        await this.delay(500);
        const extraCircle = document.getElementById('extraCircle');
        const extraValue = document.getElementById('extraValue');
        const extraFlavor = document.getElementById('extraFlavor');
        
        extraValue.textContent = result.extra;
        extraCircle.classList.add('reveal');
        if (extraFlavor && result.extraFlavor) {
            extraFlavor.textContent = result.extraFlavor;
        }

        await this.delay(400);
        const prophecyText = document.getElementById('prophecyText');
        if (prophecyText) {
            prophecyText.textContent = result.prophecy;
            prophecyText.parentElement.style.display = 'block';
        }

        // Update history table after results
        this.updateHistoryTable();
    }

    /**
     * Reset results section
     */
    resetResults() {
        document.querySelectorAll('.number-circle').forEach(circle => {
            circle.textContent = '?';
            circle.className = 'number-circle';
        });
        
        document.querySelectorAll('.number-flavor').forEach(flavor => {
            flavor.textContent = 'Summoning...';
        });

        document.getElementById('extraValue').textContent = '?';
        document.getElementById('extraCircle').className = 'extra-circle';
        document.getElementById('extraFlavor').textContent = 'The Norns weave your fate...';
        document.getElementById('prophecyText').textContent = 'The cosmos awaits...';
        
        this.hideDuplicateWarning();
    }

    /**
     * Show CSV preview
     * @param {Array} data - CSV data
     */
    showCSVPreview(data) {
        const preview = document.getElementById('uploadPreview');
        const table = document.getElementById('previewTable');
        const count = document.getElementById('previewCount');

        if (!data || data.length === 0) {
            preview.style.display = 'none';
            return;
        }

        preview.style.display = 'block';
        count.textContent = data.length;

        const headers = Object.keys(data[0]);
        let html = '<table><thead><tr>';
        headers.forEach(h => {
            html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';

        const rowsToShow = Math.min(5, data.length);
        for (let i = 0; i < rowsToShow; i++) {
            html += '<tr>';
            headers.forEach(h => {
                html += `<td>${data[i][h] || ''}</td>`;
            });
            html += '</tr>';
        }

        if (data.length > 5) {
            html += `<tr><td colspan="${headers.length}" style="text-align:center;color:var(--text-muted);">
                ... and ${data.length - 5} more rows
            </td></tr>`;
        }

        html += '</tbody></table>';
        table.innerHTML = html;
    }

    /**
     * Update stats dashboard
     * @param {Object} insights - Stats insights
     */
    updateStats(insights) {
        if (!insights) return;

        document.getElementById('totalDraws').textContent = insights.totalDraws || 0;
        document.getElementById('uniqueNumbers').textContent = insights.uniqueNumbers || 0;
        document.getElementById('coverage').textContent = insights.coverage || '0%';
        document.getElementById('hotNumbers').textContent = insights.hotNumbers?.join(', ') || '-';
        document.getElementById('coldNumbers').textContent = insights.coldNumbers?.join(', ') || '-';
        document.getElementById('frequentPair').textContent = insights.mostFrequentPair || '-';

        this.updateFrequencyChart();
        this.updateHistoryTable();
    }

    /**
     * Update frequency chart
     */
    updateFrequencyChart() {
        const chart = document.getElementById('frequencyChart');
        if (!chart) return;

        const frequency = window.app?.patternAnalyzer?.frequency || {};
        const numbers = Object.keys(frequency).map(Number).sort((a, b) => a - b);
        
        if (numbers.length === 0) {
            chart.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;width:100%;text-align:center;">No data yet. Perform rituals to build the chart!</p>';
            return;
        }

        const maxFreq = Math.max(...Object.values(frequency));
        
        let html = '';
        numbers.forEach(num => {
            const freq = frequency[num] || 0;
            const height = maxFreq > 0 ? (freq / maxFreq * 100) : 0;
            
            html += `
                <div class="chart-bar">
                    <div class="bar" style="height: ${Math.max(2, height)}%;"></div>
                    <span class="bar-label">${num}</span>
                </div>
            `;
        });

        chart.innerHTML = html;
    }

    /**
     * Update history table with all saved draws
     */
    updateHistoryTable() {
        const container = document.getElementById('historyTable');
        if (!container) return;

        const history = window.app?.csvManager?.history || [];
        
        if (history.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;text-align:center;">No history yet. Run a ritual!</p>';
            return;
        }

        let html = '<table><thead><tr>';
        html += '<th>#</th><th>Numbers</th><th>Extra</th><th>Date</th><th>Zodiac</th>';
        html += '</tr></thead><tbody>';

        const reversed = [...history].reverse();
        reversed.forEach((entry, index) => {
            const num = history.length - index;
            const numbers = entry.numbers || '';
            const extra = entry.extra || '';
            const date = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : '';
            const zodiac = entry.zodiac || '';
            
            html += `<tr>
                <td>${num}</td>
                <td class="highlight-numbers">${numbers}</td>
                <td style="color:var(--color-extra);font-weight:bold;">${extra}</td>
                <td>${date}</td>
                <td>${zodiac}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Export history to CSV string
     * @returns {string} CSV content
     */
    exportCSV() {
        const history = window.app?.csvManager?.history || [];
        
        if (history.length === 0) {
            this.showToast('⚠️ No history to export!', 'error');
            return null;
        }

        const headers = ['numbers', 'extra', 'timestamp', 'zodiac', 'prophecy', 'weather', 'moonPhase'];
        let csv = headers.join(',') + '\n';

        history.forEach(entry => {
            const row = headers.map(h => {
                let value = entry[h] || '';
                if (value.includes(',') || value.includes('"')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
            csv += row + '\n';
        });

        return csv;
    }

    /**
     * Download CSV file
     * @param {string} csvContent - CSV content
     * @param {string} filename - File name
     */
    downloadCSV(csvContent, filename = 'numbers.csv') {
        if (!csvContent) return;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast(`📥 ${filename} downloaded successfully!`, 'success');
    }

    /**
     * Show duplicate warning
     * @param {Array} duplicates - Duplicate entries
     */
    showDuplicateWarning(duplicates) {
        const warning = document.getElementById('duplicateWarning');
        if (!warning) return;

        if (duplicates && duplicates.length > 0) {
            warning.style.display = 'block';
            const matchCount = duplicates.reduce((sum, d) => sum + d.matchingNumbers.length, 0);
            warning.textContent = `⚠️ These numbers have appeared ${duplicates.length} times in your history! (${matchCount} matching numbers)`;
        } else {
            this.hideDuplicateWarning();
        }
    }

    /**
     * Hide duplicate warning
     */
    hideDuplicateWarning() {
        const warning = document.getElementById('duplicateWarning');
        if (warning) {
            warning.style.display = 'none';
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);

        this.toastTimeout = setTimeout(() => {
            toast.remove();
        }, 4000);

        toast.addEventListener('click', () => {
            toast.remove();
            clearTimeout(this.toastTimeout);
        });
    }

    /**
     * Set user callbacks
     * @param {Function} onRegister - Registration callback
     * @param {Function} onLogout - Logout callback
     */
    setUserCallbacks(onRegister, onLogout) {
        this.onRegister = onRegister;
        this.onLogout = onLogout;
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Close modal
     * @param {string} id - Modal ID
     */
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
    }
}