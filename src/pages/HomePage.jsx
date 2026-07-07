import { useState } from 'react'

export default function HomePage({ onGetStarted }) {
  const [activeTab, setActiveTab] = useState('vision')

  return (
    <div className="homepage-container">
      <nav className="homepage-navbar">
        <div className="navbar-content">
          <h1 className="brand">Remit to Revenue</h1>
          <button className="btn-login" onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      <div className="homepage-content">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
            onClick={() => setActiveTab('vision')}
          >
            Vision
          </button>
          <button
            className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            Roadmap
          </button>
          <button
            className={`tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('impact')}
          >
            Impact
          </button>
        </div>

        {/* Vision Tab */}
        {activeTab === 'vision' && (
          <div className="tab-content vision-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3 className="stat-number">25 Lakh+</h3>
                <p className="stat-label">Nepalis Working Abroad</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">20-25%</h3>
                <p className="stat-label">Of Nepal's GDP</p>
              </div>
              <div className="stat-card">
                <h3 className="stat-number">Primary</h3>
                <p className="stat-label">Household Income</p>
              </div>
            </div>

            <div className="vision-text">
              <h2>Convert Remittances Into Wealth</h2>
              <p>
                Over <strong>2.5 million Nepalis</strong> work abroad, contributing <strong>20-25% to Nepal's GDP</strong>.
                Yet most remittances go to daily consumption instead of wealth-generating investments.
              </p>
              <p style={{ marginTop: '1rem' }}>
                <strong>"Remit to Revenue"</strong> transforms this behavior—seamlessly converting financial inflows
                into productive assets for individual security and economic growth.
              </p>
              <button className="btn-primary" onClick={onGetStarted}>Start Saving Now</button>
            </div>
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="tab-content roadmap-tab">
            <div className="roadmap-card current-version">
              <span className="version-badge">v1.0 - Current</span>
              <h3>Smart Savings Foundation</h3>
              <p>Empower remittance recipients to save systematically and achieve personalized goals.</p>
              <ul className="features-list">
                <li>💳 Transaction tracking</li>
                <li>💰 Savings logging (10% tap)</li>
                <li>🎯 Personalized goals</li>
                <li>🏆 Streak tracking</li>
                <li>📊 Weekly analytics</li>
              </ul>
            </div>

            <div className="roadmap-card future-version">
              <span className="version-badge future">Future Releases</span>
              <h3>Investment Integration</h3>
              <p>Enable users to invest saved remittances in productive assets directly.</p>
              <ul className="features-list">
                <li>📈 IPO investments</li>
                <li>🛡️ Insurance policies</li>
                <li>💳 Diversified portfolio</li>
                <li>🤝 Peer lending</li>
                <li>🤖 AI recommendations</li>
              </ul>
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="tab-content impact-tab">
            <h2>Our Impact</h2>
            <div className="impact-grid">
              <div className="impact-card">
                <h4>🏠 Individual Level</h4>
                <p>Build financial security and achieve long-term wealth goals with structured savings.</p>
              </div>
              <div className="impact-card">
                <h4>🌍 National Level</h4>
                <p>Transform remittances into productive investments that drive sustainable economic growth.</p>
              </div>
              <div className="impact-card">
                <h4>👥 Community Level</h4>
                <p>Create a culture of savings and investment in remittance-receiving households.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="homepage-footer">
        <p>© 2024 Remit to Revenue • Transforming remittances into productive assets</p>
      </footer>
    </div>
  )
}
