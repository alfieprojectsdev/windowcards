// src/analytics.js

export const Analytics = {
    trackEvent(eventName, title = eventName) {
        if (typeof window !== 'undefined' && window.goatcounter) {
            window.goatcounter.count({
                path: `/event/${eventName}`,
                title: title,
                event: true
            });
        }
    },

    setupPrintTracking() {
        window.addEventListener('beforeprint', () => {
            this.trackEvent('worksheet-printed', 'Worksheet Printed');
        });
    }
};

// Initialize listeners that don't depend on DOM state
Analytics.setupPrintTracking();
