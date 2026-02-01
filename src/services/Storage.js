export const Storage = {
    IDS: ["numRows", "numCols", "numDigits", "fontSize", "operator", "avoidCarrying", "avoidBorrowing"],

    saveSettings(settings) {
        this.IDS.forEach(id => {
            // In MVC, settings are passed in, but we can also read from DOM if needed.
            // However, to keep it clean, we'll expect the settings object to match these keys.
            // Or, if persisting from DOM elements is preferred (as in original script), we can do that.
            // adhereing to the request to pass settings object.
            if (settings.hasOwnProperty(id)) {
                localStorage.setItem(id, settings[id]);
            }
        });
    },

    loadSettings() {
        const loadedSettings = {};
        this.IDS.forEach(id => {
            const val = localStorage.getItem(id);
            if (val !== null) {
                // Simple type inference based on original IDs
                if (id === 'avoidCarrying' || id === 'avoidBorrowing') {
                    loadedSettings[id] = (val === 'true');
                } else if (id === 'operator') {
                    loadedSettings[id] = val;
                } else {
                    loadedSettings[id] = parseInt(val);
                }
            }
        });
        return loadedSettings;
    }
};
