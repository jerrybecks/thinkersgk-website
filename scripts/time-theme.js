/**
 * THINKERS GK - Time-Based Theme System
 * Automatically changes colors based on time of day
 */

(function() {
    'use strict';

    const TimeTheme = {
        // Time ranges (24-hour format)
        TIME_RANGES: {
            morning: { start: 5, end: 11, name: 'morning', greeting: 'Good Morning', icon: '🌅' },
            afternoon: { start: 12, end: 16, name: 'afternoon', greeting: 'Good Afternoon', icon: '☀️' },
            evening: { start: 17, end: 19, name: 'evening', greeting: 'Good Evening', icon: '🌇' },
            night: { start: 20, end: 4, name: 'night', greeting: 'Good Evening', icon: '🌙' }
        },

        // Current theme state
        currentTheme: null,

        /**
         * Initialize the time theme system
         */
        init() {
            this.applyTheme();
            this.updateTimeIndicator();
            
            // Update every minute to catch theme changes
            setInterval(() => {
                this.applyTheme();
                this.updateTimeIndicator();
            }, 60000);

            // Update greeting immediately and then every hour
            this.updateGreeting();
            setInterval(() => this.updateGreeting(), 3600000);

            console.log('[TimeTheme] Initialized');
        },

        /**
         * Get current time period based on hour
         */
        getTimePeriod(hour = null) {
            if (hour === null) {
                hour = new Date().getHours();
            }

            // Check each time range
            for (const [key, range] of Object.entries(this.TIME_RANGES)) {
                if (range.start <= range.end) {
                    // Normal range (e.g., 5-11)
                    if (hour >= range.start && hour <= range.end) {
                        return range;
                    }
                } else {
                    // Wrap-around range (e.g., 20-4 for night)
                    if (hour >= range.start || hour <= range.end) {
                        return range;
                    }
                }
            }

            // Default to night if something goes wrong
            return this.TIME_RANGES.night;
        },

        /**
         * Apply the appropriate theme based on time
         */
        applyTheme() {
            const period = this.getTimePeriod();
            const body = document.body;
            
            // Only update if theme changed
            if (this.currentTheme !== period.name) {
                // Remove old theme
                body.removeAttribute('data-time-theme');
                
                // Force reflow
                void body.offsetHeight;
                
                // Apply new theme
                body.setAttribute('data-time-theme', period.name);
                this.currentTheme = period.name;
                
                console.log(`[TimeTheme] Applied theme: ${period.name}`);
                
                // Dispatch custom event for other scripts
                window.dispatchEvent(new CustomEvent('themechange', {
                    detail: { theme: period.name, period: period }
                }));
            }
        },

        /**
         * Update the time indicator display
         */
        updateTimeIndicator() {
            const indicator = document.getElementById('timeIndicator');
            const iconEl = document.getElementById('timeIcon');
            const textEl = document.getElementById('timeText');
            
            if (!indicator || !iconEl || !textEl) return;

            const now = new Date();
            const period = this.getTimePeriod(now.getHours());
            
            // Update icon
            iconEl.textContent = period.icon;
            
            // Update text with Tokyo time
            const tokyoTime = this.getTokyoTime();
            const timeString = tokyoTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            
            textEl.textContent = `${period.name.charAt(0).toUpperCase() + period.name.slice(1)} in Tokyo (${timeString})`;
        },

        /**
         * Update the greeting text
         */
        updateGreeting() {
            const greetingEl = document.getElementById('timeGreeting');
            if (!greetingEl) return;

            const hour = new Date().getHours();
            const period = this.getTimePeriod(hour);
            
            greetingEl.textContent = period.greeting;
        },

        /**
         * Get current time in Tokyo
         */
        getTokyoTime() {
            return new Date(new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Tokyo'
            }));
        },

        /**
         * Get formatted Tokyo time string
         */
        getTokyoTimeString() {
            const tokyoTime = this.getTokyoTime();
            return tokyoTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            });
        },

        /**
         * Manually set theme (for testing or user preference)
         */
        setTheme(themeName) {
            const validThemes = ['morning', 'afternoon', 'evening', 'night', 'auto'];
            
            if (!validThemes.includes(themeName)) {
                console.error(`[TimeTheme] Invalid theme: ${themeName}`);
                return;
            }

            const body = document.body;
            
            if (themeName === 'auto') {
                // Resume automatic theming
                this.applyTheme();
            } else {
                // Set manual theme
                body.removeAttribute('data-time-theme');
                void body.offsetHeight;
                body.setAttribute('data-time-theme', themeName);
                this.currentTheme = themeName;
            }
        },

        /**
         * Get current theme info
         */
        getCurrentTheme() {
            return {
                theme: this.currentTheme,
                period: this.getTimePeriod(),
                tokyoTime: this.getTokyoTimeString()
            };
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TimeTheme.init());
    } else {
        TimeTheme.init();
    }

    // Expose to global scope for debugging
    window.TimeTheme = TimeTheme;

})();
