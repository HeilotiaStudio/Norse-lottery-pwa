/**
 * Google Sheets API via Apps Script
 * Handles saving and loading lottery history
 */

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyCIcxtATtG8ioijOQwRHXMffMMRZpSwXG_VFILLfZ_CA8HuJ_aKKq1fCYVp3NlELoe/exec';

export const SheetsDB = {

    async save(entry) {
        try {
            await fetch(SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', entry })
            });
        } catch (error) {
            console.warn('Sheets save failed, using localStorage fallback:', error);
        }
    },

    async load() {
        try {
            const res = await fetch(`${SHEETS_URL}?action=load`);
            const data = await res.json();
            return data.rows || [];
        } catch (error) {
            console.warn('Sheets load failed, using localStorage fallback:', error);
            return [];
        }
    }
};
