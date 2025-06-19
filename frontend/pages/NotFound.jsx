import React from 'react';

// All styles are defined in this JavaScript object, keeping everything in one file.
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '650px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  icon: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#6366f1', // Indigo
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937', // Dark gray
    marginBottom: '12px',
  },
  description: {
    fontSize: '1.125rem',
    color: '#4b5563', // Medium gray
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  stepsGuide: {
    textAlign: 'left',
    borderTop: '1px solid #e5e7eb', // Light gray border
    paddingTop: '24px',
    marginTop: '24px',
  },
  stepsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: '20px',
  },
  stepsList: {
    listStyleType: 'decimal',
    listStylePosition: 'inside',
    paddingLeft: '0',
    margin: 0,
    color: '#374151',
  },
  stepListItem: {
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  strongText: {
    fontWeight: '600',
    color: '#3b82f6', // Blue
  },
  footer: {
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
};

// Reusable SVG Icon Component
const SetupIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='64'
    height='64'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'></path>
    <circle cx='8.5' cy='7' r='4'></circle>
    <line x1='20' y1='8' x2='20' y2='14'></line>
    <line x1='23' y1='11' x2='17' y2='11'></line>
  </svg>
);

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>
          <SetupIcon />
        </div>
        <h2>iSnapToShop</h2>
        <h1 style={styles.title}>Almost There!</h1>
        <p style={styles.description}>
          To finish setup, please open the extension from your Fynd Platform dashboard.
        </p>

        <div style={styles.stepsGuide}>
          <h2 style={styles.stepsTitle}>How to Complete Setup</h2>
          <ol style={styles.stepsList}>
            <li style={styles.stepListItem}>
              Navigate to <strong style={styles.strongText}>Sales Channels</strong> on your
              dashboard.
            </li>
            <li style={styles.stepListItem}>
              Find this extension in the list and click to open it.
            </li>
          </ol>
        </div>

        <p style={styles.footer}>Once setup is complete, the extension will load here.</p>
      </div>
    </div>
  );
}
