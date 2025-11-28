# Divinities Feature Walkthrough

I have implemented the Divinities feature, which adds a new section to the Oduverse app for exploring Orisa and Vodun pantheons.

## Changes

### 1. Data
- Created `js/data/divinities.js` containing structured data for Orisa and Vodun deities.

### 2. Navigation
- Added "DIVINITIES" link to the main navigation bar in `index.html`.

### 3. Views
- **Divinities List**: A two-column layout displaying Orisa and Vodun lists side-by-side.
- **Divinity Detail**: A detailed view for each deity showing their title, description, attributes, colors, offerings, and sacred day.

### 4. Styling
- Added new CSS classes in `css/components.css` for the divinities grid and detail cards, matching the app's premium aesthetic.

## Verification

1.  **Open the App**: Reload `index.html`.
2.  **Navigate**: Click the "DIVINITIES" tab in the header.
3.  **Check List**: Verify you see two columns: "Orisa (Yoruba)" and "Vodun (Fon)".
4.  **View Detail**: Click on any deity (e.g., "Shango" or "Legba").
5.  **Check Details**: Verify the detail page shows the correct information (Title, Attributes, etc.).
6.  **Back Navigation**: Click the "← Back" button to return to the list.
