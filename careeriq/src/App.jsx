import React from "react";

export default function App(){
  return (
    <div className="ciq-root">
      {/* HEADER */}
      <header className="ciq-header">
        <div className="ciq-container">
          <div className="ciq-brand">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{
                width:48,height:48,borderRadius:12, background:"#12b886",
                display:"flex",alignItems:"center",justifyContent:"center", color:"#fff", fontWeight:900
              }}>IQ</div>
              <div>
                <div className="ciq-title">CareerIQ</div>
                <div className="ciq-sub">AI-POWERED CAREER RECOMMENDER</div>
              </div>
            </div>
          </div>

          <nav className="ciq-nav" aria-label="top nav">
            <button className="ciq-link">Insights</button>
            <button className="ciq-link">Skill Tests</button>
            <button className="ciq-cta">Profile</button>
          </nav>
        </div>
      </header>

      {/* GRID: Left main + Right aside */}
      <div className="ciq-grid">
        {/* LEFT (main content) */}
        <main className="ciq-main">
          {/* HERO */}
          <section className="ciq-hero">
            <div className="ciq-container">
              <span className="ciq-pill">AI-POWERED CAREER MATCHING</span>
              <h1 className="ciq-h1">Find careers aligned with who you are</h1>
              <p className="ciq-lead">Take a 7-minute comprehensive assessment and discover careers that match your traits, with real salary and work-life balance data from the Indian market.</p>
              <div className="ciq-cta-row">
                <button className="ciq-primary">Start Assessment</button>
                <button className="ciq-secondary">Show Navigation Guide</button>
              </div>

              {/* Popular careers - small cards row */}
              <div className="ciq-popular">
                <h2>Popular Careers in India</h2>
                <div className="popular-row">
                  <div className="pop-card">
                    <div className="pop-left">
                      <div className="pop-icon">💻</div>
                      <div>
                        <div className="pop-name">Software Engineer</div>
                        <div className="pop-sub">Build innovative software solutions</div>
                      </div>
                    </div>
                    <div className="pop-sal-block">
                      <div className="pop-sal-top">₹8–15L</div>
                      <div className="pop-sal-bottom">LPA</div>
                    </div>
                  </div>

                  <div className="pop-card">
                    <div className="pop-left">
                      <div className="pop-icon">🩺</div>
                      <div>
                        <div className="pop-name">Doctor</div>
                        <div className="pop-sub">Save lives and improve health</div>
                      </div>
                    </div>
                    <div className="pop-sal-block">
                      <div className="pop-sal-top">₹10–25L</div>
                      <div className="pop-sal-bottom">LPA</div>
                    </div>
                  </div>

                  <div className="pop-card">
                    <div className="pop-left">
                      <div className="pop-icon">🍳</div>
                      <div>
                        <div className="pop-name">Chef</div>
                        <div className="pop-sub">Create culinary masterpieces</div>
                      </div>
                    </div>
                    <div className="pop-sal-block">
                      <div className="pop-sal-top">₹4–12L</div>
                      <div className="pop-sal-bottom">LPA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Explore by Sector */}
          <section style={{padding:"36px 0"}}>
            <div className="ciq-container">
              <h2 style={{textAlign:"center",fontSize:28,fontWeight:800}}>Explore by Sector</h2>
              <div className="cards" style={{marginTop:24}}>
                <div className="card"> <h3>Medical Careers</h3> <div className="muted">Explore careers →</div></div>
                <div className="card"> <h3>Engineering</h3> <div className="muted">Explore careers →</div></div>
                <div className="card"> <h3>Business</h3> <div className="muted">Explore careers →</div></div>
                <div className="card"> <h3>Teaching</h3> <div className="muted">Explore careers →</div></div>
              </div>
            </div>
          </section>

          {/* Stats Row */}
          <section style={{padding:"36px 0"}}>
            <div className="ciq-container">
              <div className="ciq-stats">
                <div style={{textAlign:"center"}}><div style={{background:"#e8faf4",borderRadius:14,width:64,height:64,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>🎯</div><div className="big">100+</div><div className="muted">Career Options</div></div>
                <div style={{textAlign:"center"}}><div style={{background:"#e8faf4",borderRadius:14,width:64,height:64,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>🧠</div><div className="big">24</div><div className="muted">Assessment Questions</div></div>
                <div style={{textAlign:"center"}}><div style={{background:"#e8faf4",borderRadius:14,width:64,height:64,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>✨</div><div className="big">7</div><div className="muted">Happiness Dimensions</div></div>
                <div style={{textAlign:"center"}}><div style={{background:"#e8faf4",borderRadius:14,width:64,height:64,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>📊</div><div className="big">6+</div><div className="muted">Skill Tests</div></div>
              </div>
            </div>
          </section>

          {/* Feature box */}
          <section style={{padding:"36px 0"}}>
            <div className="ciq-container">
              <div style={{display:"flex",justifyContent:"center"}}>
                <div style={{maxWidth:1000,background:"#fff",padding:28,borderRadius:14,boxShadow:"0 12px 36px rgba(6,10,12,0.06)"}}>
                  <div style={{display:"flex",gap:40,justifyContent:"space-between"}}>
                    <ul style={{flex:1,margin:0,padding:0,listStyle:"none"}}>
                      <li style={{fontWeight:800,marginBottom:12}}>Built for India</li>
                      <li className="muted">• Salary data in LPA (Lakhs Per Annum)</li>
                      <li className="muted">• 100+ careers including vocational</li>
                      <li className="muted">• Live market trends</li>
                    </ul>
                    <ul style={{flex:1,margin:0,padding:0,listStyle:"none"}}>
                      <li style={{fontWeight:800,marginBottom:12}}>Science-backed matching</li>
                      <li className="muted">• 24-question assessment</li>
                      <li className="muted">• 10 personality trait dimensions</li>
                      <li className="muted">• Mini skill tests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* For Everyone + CTA green band */}
          <section style={{padding:"28px 0"}}>
            <div className="ciq-container" style={{textAlign:"center"}}>
              <div style={{maxWidth:760,margin:"0 auto"}}>
                <h3 style={{fontSize:26,fontWeight:800}}>For Everyone</h3>
                <p className="muted">Whether you're a college student exploring options, a professional considering a career change, or someone looking to validate your current path — CareerIQ provides personalized guidance based on who you really are.</p>
              </div>
            </div>
          </section>

          <section style={{padding:"32px 0", background:"#0b7f67", color:"#fff"}}>
            <div className="ciq-container" style={{textAlign:"center"}}>
              <h2 style={{fontSize:30,fontWeight:900}}>Ready to find your perfect career?</h2>
              <p style={{opacity:0.9}}>Join thousands of professionals who discovered their ideal path</p>
              <div style={{marginTop:18}}><button className="ciq-primary" style={{background:"#fff",color:"#0b7f67"}}>Start your assessment now</button></div>
            </div>
          </section>

          {/* Footer */}
          <footer className="ciq-footer">
            <div className="ciq-container">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>© 2025 CareerIQ. Career data based on Indian market research.</div>
                <div style={{display:"flex",gap:12}}><a className="ciq-link">About</a><a className="ciq-link">Data Sources</a></div>
              </div>
            </div>
          </footer>
        </main>

        {/* RIGHT (aside) */}
        <aside className="ciq-aside">
          <div className="ciq-panel">
            <h4>Live Market Insights</h4>
            <div className="ciq-trend">
              <div>
                <div className="t-title">Data Science & AI</div>
                <div className="t-sub">AI & ML hiring surge</div>
              </div>
              <div className="t-sal">₹8–35 LPA</div>
            </div>

            <div style={{marginTop:14}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:18}}>
                <div style={{textAlign:"center"}}><div style={{fontWeight:900}}>100+</div><div className="muted">Career Options</div></div>
                <div style={{textAlign:"center"}}><div style={{fontWeight:900}}>24</div><div className="muted">Questions</div></div>
                <div style={{textAlign:"center"}}><div style={{fontWeight:900}}>6+</div><div className="muted">Skill Tests</div></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
