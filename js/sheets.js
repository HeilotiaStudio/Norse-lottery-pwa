/**
 * Google Sheets API via Apps Script
 */

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyCIcxtATtG8ioijOQwRHXMffMMRZpSwXG_VFILLfZ_CA8HuJ_aKKq1fCYVp3NlELoe/exec';

export const SheetsDB = {

    async save(entry) {
        try {
            // Use a form-encoded POST to avoid CORS preflight issues with Apps Script
            const params = new URLSearchParams();
            params.append('action', 'save');
            params.append('entry', JSON.stringify(entry));

            await fetch(SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: params
            });
            console.log('✅ Saved to Google Sheets');
        } catch (error) {
            console.warn('⚠️ Sheets save failed:', error);
        }
    },

    async load() {
        try {
            const res = await fetch(`${SHEETS_URL}?action=load`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log(`✅ Loaded ${data.rows?.length || 0} rows from Google Sheets`);
            return data.rows || [];
        } catch (error) {
            console.warn('⚠️ Sheets load failed:', error);
            return [];
        }
    }
};
