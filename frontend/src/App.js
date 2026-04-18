import React, { useState } from 'react';
import PdfToWord from './pages/PdfToWord';
import WordToPdf from './pages/WordToPdf';
import MergePdf from './pages/MergePdf';
import ImageResize from './pages/ImageResize';

const TABS = [
  { id: 'pdf-to-word', label: '📄 PDF → Word', color: '#3182ce' },
  { id: 'word-to-pdf', label: '📝 Word → PDF', color: '#6b46c1' },
  { id: 'merge',       label: '🔗 Merge PDFs', color: '#2f855a' },
  { id: 'image',       label: '🖼️ Image Resize', color: '#dd6b20' },
];

export default function App() {
  const [active, setActive] = useState('pdf-to-word');
  const activeTab = TABS.find((t) => t.id === active);

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>🛠️ DocTools</div>
          <p style={styles.tagline}>PDF · Word · Image conversions — fast &amp; affordable</p>
        </div>
      </header>

      {/* Tab navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                ...styles.tab,
                ...(active === tab.id
                  ? { background: tab.color, color: '#fff', borderColor: tab.color }
                  : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main style={styles.main}>
        <div style={{ ...styles.card, borderTop: `4px solid ${activeTab.color}` }}>
          {active === 'pdf-to-word' && <PdfToWord />}
          {active === 'word-to-pdf' && <WordToPdf />}
          {active === 'merge'       && <MergePdf />}
          {active === 'image'       && <ImageResize />}
        </div>

        {/* Pricing summary */}
        <div style={styles.pricing}>
          <h3 style={styles.pricingTitle}>💳 Pricing</h3>
          <div style={styles.pricingGrid}>
            <div style={styles.pricingItem}>
              <span>PDF ↔ Word</span>
              <span>1st page <strong>free</strong>, then $1/page</span>
            </div>
            <div style={styles.pricingItem}>
              <span>Image Resize</span>
              <span><strong>$1</strong> per file</span>
            </div>
            <div style={styles.pricingItem}>
              <span>PDF Merge</span>
              <span><strong>$1</strong> per 5 pages</span>
            </div>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} DocTools · Secure payments via Stripe
      </footer>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { background: '#1a202c', color: '#fff', padding: '20px 0' },
  headerInner: { maxWidth: 900, margin: '0 auto', padding: '0 24px' },
  logo: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' },
  tagline: { color: '#a0aec0', fontSize: 14, marginTop: 4 },
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 },
  navInner: {
    maxWidth: 900, margin: '0 auto', padding: '12px 24px',
    display: 'flex', gap: 10, flexWrap: 'wrap',
  },
  tab: {
    padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500,
    color: '#4a5568', transition: 'all 0.15s',
  },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '32px 24px' },
  card: {
    background: '#fff', borderRadius: 12, padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24,
  },
  pricing: {
    background: '#fff', borderRadius: 12, padding: '24px 32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  pricingTitle: { fontSize: 16, fontWeight: 700, color: '#1a202c', marginBottom: 16 },
  pricingGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  pricingItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: '#f7fafc', borderRadius: 8,
    fontSize: 14, color: '#4a5568',
  },
  footer: {
    textAlign: 'center', padding: '20px', background: '#1a202c',
    color: '#718096', fontSize: 13,
  },
};
