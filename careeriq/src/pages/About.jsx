import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="ciq-container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <BackButton />

      <header style={{ marginTop: 8, marginBottom: 28 }}>
        <h1 className="ciq-h1" style={{ margin: 0, fontSize: 44, lineHeight: 1.05 }}>About CareerIQ</h1>
        <p className="muted" style={{ marginTop: 12, maxWidth: 960, color: 'var(--ciq-muted)' }}>
          CareerIQ is an evidence-driven career recommendation platform that helps students and early-career
          professionals explore careers aligned with their skills, values and life priorities. It combines a
          concise assessment, practical skill tests and contextual market data to produce actionable career
          matches tailored for the Indian job market.
        </p>
      </header>

      {/* HERO CARDS */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          <div style={{ background: 'linear-gradient(180deg,#fff,#fbfffd)', padding: 22, borderRadius: 14, border: '1px solid #eef7f2', boxShadow: '0 6px 20px rgba(10,30,20,0.04)' }}>
            <h3 style={{ marginTop: 0, fontSize: 20 }}>Platform workflow</h3>

            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--ciq-dark)', flex: 1 }}>
                <li style={{ marginBottom: 8 }}><strong>Take the assessment</strong> — a short questionnaire that builds a personality and happiness profile.</li>
                <li style={{ marginBottom: 8 }}><strong>Receive recommendations</strong> — careers suggested based on your profile and priorities.</li>
                <li style={{ marginBottom: 8 }}><strong>Refine priorities</strong> — adjust sliders to re-rank results in real time.</li>
                <li style={{ marginBottom: 0 }}><strong>Explore next steps</strong> — review role summaries, responsibilities and suggested projects.</li>
              </ol>

              <div style={{ minWidth: 220 }}>
                <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #eef7f2' }}>
                  <h5 style={{ margin: '0 0 8px 0' }}>Quick facts</h5>
                  <div style={{ color: 'var(--ciq-muted)', lineHeight: 1.4 }}>
                    <div><strong>100+</strong> curated career profiles</div>
                    <div><strong>~7 minutes</strong> average assessment time</div>
                    <div><strong>Interactive</strong> priority sliders</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, borderTop: '1px dashed #eef7f2', paddingTop: 16, color: 'var(--ciq-muted)' }}>
              <strong>Note:</strong> CareerIQ is a research-oriented tool to support exploration and early-stage decision-making — it does not replace professional career counselling.
            </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 12, background: '#fff', border: '1px solid #eef7f2', boxShadow: '0 4px 12px rgba(10,20,15,0.03)' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>How CareerIQ helps</h4>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ciq-muted)', lineHeight: 1.6 }}>
                <li>Identify roles that fit your skills</li>
                <li>Compare compensation, stress and work-life factors</li>
                <li>Get practical next steps to build skills</li>
              </ul>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: '#f7fff9', border: '1px solid #eef7f2' }}>
              <h5 style={{ margin: '0 0 6px 0' }}>Get started</h5>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate('/quiz')} className="ciq-primary" style={{ padding: '8px 12px', borderRadius: 8 }}>Take assessment</button>
                <button onClick={() => navigate('/careers')} className="small-cta" style={{ padding: '8px 12px', borderRadius: 8 }}>Browse careers</button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #eef7f2', boxShadow: '0 6px 20px rgba(10,30,20,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>Methodology</h3>
          <p className="muted" style={{ marginTop: 8 }}>CareerIQ uses a multi-dimensional matching approach combining assessment results, user priorities and market data to score and rank careers. Recommendations include brief explanations and suggested next steps.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
            <div style={{ padding: 12, borderRadius: 8, background: '#f8fffb', border: '1px solid #eef7f2' }}>
              <strong>Assessment</strong>
              <div className="muted">24 likert-style items measuring work preferences and practical skills.</div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: '#f3f7ff', border: '1px solid #eef3ff' }}>
              <strong>Matching</strong>
              <div className="muted">Combines top-skill detection, happiness sliders and normalized market benchmarks.</div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: '#fff8f5', border: '1px solid #fbeeea' }}>
              <strong>Action plan</strong>
              <div className="muted">Each recommended role includes practical next steps, project ideas and resource links.</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: '10px 0' }}>Scales & normalization</h4>
            <ul style={{ color: 'var(--ciq-muted)' }}>
              <li><strong>Mental stress (0–100):</strong> Higher values indicate more stressful roles.</li>
              <li><strong>Salary (LPA):</strong> Market salary in lakhs per annum, normalised for scoring.</li>
              <li><strong>Work-life balance (0–100):</strong> Higher values indicate better balance.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DIMENSIONS */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #eef7f2', boxShadow: '0 6px 20px rgba(10,30,20,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>Job happiness dimensions</h3>
          <p className="muted">The Job Happiness Index compares your preferences against career benchmarks across multiple dimensions.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
            {[
              'Compensation', 'Job security', 'Work-life balance', 'Growth & learning',
              'Work environment', 'Autonomy', 'Recognition'
            ].map((d) => (
              <div key={d} style={{ padding: 12, borderRadius: 10, background: '#fbfff7', border: '1px solid #eef7f2', minHeight: 72, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <strong style={{ marginBottom: 6 }}>{d}</strong>
                <small className="muted">Indicator</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE & DATA */}
      <section style={{ marginBottom: 18 }}>
        <div style={{ background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #eef7f2', boxShadow: '0 6px 20px rgba(10,30,20,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>Coverage & regional focus</h3>
          <p className="muted">CareerIQ covers 100+ career profiles across technology, healthcare, engineering, business, education, creative industries and skilled trades. Salary bands are tailored to the Indian context with regional adjustments where applicable.</p>

          <p className="muted" style={{ marginTop: 8 }}>
            The platform is intended as a research tool for exploration and early-stage decision-making and does not substitute professional career counselling.
          </p>
        </div>
      </section>

      {/* CONTRIBUTIONS */}
      <section style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <div style={{ background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #eef7f2', boxShadow: '0 6px 20px rgba(10,30,20,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>Contributing & data improvements</h3>
          <p className="muted">Contributions are welcome as pull requests, issue reports or by sharing validated datasets. Improvements that help accuracy and coverage are especially valuable (career descriptions, salary sources, skills mapping).</p>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <a href="https://github.com/ZainabShujat/Career-Recommender-Mini-Project/" target="_blank" rel="noreferrer" className="small-cta" style={{ padding: '8px 12px', borderRadius: 8 }}>Repository</a>
            <a href="mailto:zainabshujatali@gmail.com" className="small-cta" style={{ padding: '8px 12px', borderRadius: 8 }}>Contact</a>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #eef7f2' }}>
            <h5 style={{ margin: 0 }}>Data sources</h5>
            <div className="muted">Public salary surveys, industry reports and curated community inputs.</div>
          </div>
        </aside>
      </section>

      <footer style={{ marginTop: 26, textAlign: 'center', color: 'var(--ciq-muted)' }}>
        <small>CareerIQ is a research-oriented platform intended to support career exploration and does not substitute professional career counselling.</small>
      </footer>
    </div>
  );
}
