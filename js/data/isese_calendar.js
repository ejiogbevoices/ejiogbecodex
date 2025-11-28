/**
 * Isese Calendar Logic
 * Based on a 4-day cycle.
 * Anchor Date: November 1, 2025 = Day 1 (Obatala...)
 */

const ISESE_DAYS = [
    {
        name: "Ọbàtálá / Egúngún Day",
        deities: "Ọbàtálá/Òrìṣà Ńlá, Egúngún, Ògìrìyán, Ọbalúayé/Ṣànpọ̀nná",
        color: "#ffffff" // White for Obatala
    },
    {
        name: "Ifá / Ọ̀ṣun Day",
        deities: "Ifá, Èṣù-Ọdara, Odù, Ọ̀ṣun, Ẹgbẹ́, Olókun",
        color: "#d4af37" // Gold/Green for Ifa/Osun
    },
    {
        name: "Ògún / Òrìṣà-Oko Day",
        deities: "Ògún, Ìja, Ọ̀ṣọ́ọ̀ṣì, Òrìṣà-Oko, Erinlẹ̀",
        color: "#2e8b57" // Green/Iron for Ogun
    },
    {
        name: "Ṣàngó / Ọya Day",
        deities: "Ṣàngó/Jàkúta, Ọya, Aganjú",
        color: "#ff0000" // Red for Sango
    }
];

// Anchor date: November 1, 2025 is Index 0 (Obatala Day)
// Note: Month is 0-indexed in JS Date (10 = November)
const ANCHOR_DATE = new Date(2025, 10, 1);

const IseseCalendar = {
    /**
     * Get the Isese day details for a specific date
     * @param {Date} date 
     * @returns {Object} Isese day object from ISESE_DAYS
     */
    getDay: function (date) {
        // Normalize dates to midnight to avoid time zone/time issues
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        const anchor = new Date(ANCHOR_DATE);
        anchor.setHours(0, 0, 0, 0);

        // Calculate difference in days
        const diffTime = d.getTime() - anchor.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Calculate index (handle negative days for past dates correctly)
        // JavaScript % operator can return negative for negative numbers
        let index = diffDays % 4;
        if (index < 0) {
            index += 4;
        }

        return ISESE_DAYS[index];
    },

    /**
     * Generate calendar data for a specific month
     * @param {number} year 
     * @param {number} month (0-11)
     * @returns {Array} Array of day objects
     */
    generateMonth: function (year, month) {
        const days = [];
        const date = new Date(year, month, 1);

        while (date.getMonth() === month) {
            days.push({
                date: new Date(date),
                dayOfMonth: date.getDate(),
                isese: this.getDay(date)
            });
            date.setDate(date.getDate() + 1);
        }
        return days;
    },

    getDeities: function () {
        return ISESE_DAYS;
    }
};

// Export to window
window.IseseCalendar = IseseCalendar;
