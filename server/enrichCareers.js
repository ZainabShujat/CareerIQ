// server/enrichCareers.js
// Run once: node enrichCareers.js
// Reads careers.json, adds requiredTraits/requiredSkills/lifestyleProfile, writes enriched file
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const careers = JSON.parse(fs.readFileSync(path.join(__dirname, "data/careers.json"), "utf8"));

// ── Tag-based defaults ────────────────────────────────────────────────────────
function getDefaults(tags, title) {
  const t = tags.map(x => x.toLowerCase());
  const ti = title.toLowerCase();

  // personality traits: curiosity, creativity, structure, leadership, social,
  //                     independence, riskTolerance, collaboration, analytical
  let traits = { curiosity:50, creativity:50, structure:50, leadership:50,
                 social:50, independence:50, riskTolerance:50, collaboration:50, analytical:50 };

  // skill requirements: analytical, verbal, quantitative, attentionToDetail,
  //                     communication, creativity, technicalLiteracy
  let skills = { analytical:50, verbal:50, quantitative:50, attentionToDetail:50,
                 communication:50, creativity:50, technicalLiteracy:50 };

  // lifestyle: stressLevel(0-100 higher=worse), salaryPotential(0-100), workLifeBalance(0-100 higher=better),
  //            jobSecurity(0-100), remoteWork(0-100), leadershipOpportunity(0-100)
  let lifestyle = { stressLevel:50, salaryPotential:50, workLifeBalance:50,
                    jobSecurity:55, remoteWork:50, leadershipOpportunity:50 };

  // Engineering / Software
  if (t.some(x => ["engineering","software","infrastructure","cloud","security","devops","mobile","embedded","hardware","robotics","electrical","mechanical","civil"].includes(x))) {
    Object.assign(traits, { curiosity:75, creativity:55, structure:75, leadership:45, social:35, independence:65, riskTolerance:40, collaboration:60, analytical:85 });
    Object.assign(skills, { analytical:85, verbal:40, quantitative:75, attentionToDetail:80, communication:50, creativity:45, technicalLiteracy:90 });
    Object.assign(lifestyle, { stressLevel:65, salaryPotential:75, workLifeBalance:55, jobSecurity:75, remoteWork:70, leadershipOpportunity:45 });
  }

  // Data / Analytics / AI
  if (t.some(x => ["data","ai","analytics","quant","bio"].includes(x))) {
    Object.assign(traits, { curiosity:85, creativity:60, structure:70, leadership:40, social:35, independence:70, riskTolerance:45, collaboration:55, analytical:90 });
    Object.assign(skills, { analytical:90, verbal:45, quantitative:85, attentionToDetail:75, communication:45, creativity:55, technicalLiteracy:85 });
    Object.assign(lifestyle, { stressLevel:60, salaryPotential:80, workLifeBalance:60, jobSecurity:70, remoteWork:75, leadershipOpportunity:40 });
  }

  // Design / UX / Creative
  if (t.some(x => ["design","ux","creative","media","animation","content"].includes(x))) {
    Object.assign(traits, { curiosity:75, creativity:90, structure:45, leadership:45, social:60, independence:65, riskTolerance:55, collaboration:65, analytical:50 });
    Object.assign(skills, { analytical:45, verbal:65, quantitative:35, attentionToDetail:75, communication:65, creativity:90, technicalLiteracy:55 });
    Object.assign(lifestyle, { stressLevel:55, salaryPotential:55, workLifeBalance:65, jobSecurity:50, remoteWork:65, leadershipOpportunity:40 });
  }

  // Business / Management / Operations
  if (t.some(x => ["business","management","operations","logistics","consulting"].includes(x))) {
    Object.assign(traits, { curiosity:60, creativity:55, structure:70, leadership:70, social:70, independence:50, riskTolerance:50, collaboration:75, analytical:70 });
    Object.assign(skills, { analytical:70, verbal:70, quantitative:65, attentionToDetail:65, communication:80, creativity:50, technicalLiteracy:50 });
    Object.assign(lifestyle, { stressLevel:65, salaryPotential:65, workLifeBalance:50, jobSecurity:60, remoteWork:55, leadershipOpportunity:70 });
  }

  // Product Management
  if (t.some(x => ["product"].includes(x))) {
    Object.assign(traits, { curiosity:80, creativity:65, structure:60, leadership:80, social:75, independence:55, riskTolerance:60, collaboration:80, analytical:75 });
    Object.assign(skills, { analytical:75, verbal:75, quantitative:65, attentionToDetail:60, communication:85, creativity:65, technicalLiteracy:65 });
    Object.assign(lifestyle, { stressLevel:70, salaryPotential:80, workLifeBalance:50, jobSecurity:65, remoteWork:60, leadershipOpportunity:75 });
  }

  // Medical / Healthcare
  if (t.some(x => ["medical","care","pharmacy","healthcare","public-health"].includes(x))) {
    Object.assign(traits, { curiosity:65, creativity:40, structure:80, leadership:55, social:80, independence:40, riskTolerance:30, collaboration:70, analytical:70 });
    Object.assign(skills, { analytical:70, verbal:65, quantitative:60, attentionToDetail:85, communication:75, creativity:35, technicalLiteracy:55 });
    Object.assign(lifestyle, { stressLevel:75, salaryPotential:65, workLifeBalance:40, jobSecurity:85, remoteWork:25, leadershipOpportunity:50 });
  }

  // Research / Science
  if (t.some(x => ["research","science","biotech"].includes(x))) {
    Object.assign(traits, { curiosity:90, creativity:70, structure:65, leadership:45, social:40, independence:75, riskTolerance:55, collaboration:55, analytical:85 });
    Object.assign(skills, { analytical:85, verbal:60, quantitative:80, attentionToDetail:80, communication:55, creativity:65, technicalLiteracy:70 });
    Object.assign(lifestyle, { stressLevel:55, salaryPotential:65, workLifeBalance:65, jobSecurity:60, remoteWork:60, leadershipOpportunity:40 });
  }

  // Teaching / Education
  if (t.some(x => ["teaching","education"].includes(x))) {
    Object.assign(traits, { curiosity:70, creativity:65, structure:75, leadership:65, social:85, independence:45, riskTolerance:30, collaboration:70, analytical:55 });
    Object.assign(skills, { analytical:55, verbal:85, quantitative:45, attentionToDetail:65, communication:90, creativity:65, technicalLiteracy:40 });
    Object.assign(lifestyle, { stressLevel:55, salaryPotential:40, workLifeBalance:65, jobSecurity:80, remoteWork:35, leadershipOpportunity:55 });
  }

  // Marketing / Sales / Growth
  if (t.some(x => ["marketing","sales","growth","client","customer"].includes(x))) {
    Object.assign(traits, { curiosity:60, creativity:70, structure:45, leadership:60, social:85, independence:50, riskTolerance:65, collaboration:70, analytical:60 });
    Object.assign(skills, { analytical:60, verbal:80, quantitative:55, attentionToDetail:50, communication:90, creativity:75, technicalLiteracy:45 });
    Object.assign(lifestyle, { stressLevel:65, salaryPotential:60, workLifeBalance:55, jobSecurity:55, remoteWork:55, leadershipOpportunity:60 });
  }

  // Legal
  if (t.some(x => ["legal","compliance","policy"].includes(x))) {
    Object.assign(traits, { curiosity:65, creativity:40, structure:90, leadership:55, social:55, independence:55, riskTolerance:20, collaboration:50, analytical:80 });
    Object.assign(skills, { analytical:80, verbal:85, quantitative:55, attentionToDetail:90, communication:75, creativity:30, technicalLiteracy:40 });
    Object.assign(lifestyle, { stressLevel:70, salaryPotential:70, workLifeBalance:40, jobSecurity:75, remoteWork:45, leadershipOpportunity:55 });
  }

  // Finance / Investment / Banking
  if (t.some(x => ["finance","investment","banking","credit","quant","risk"].includes(x))) {
    Object.assign(traits, { curiosity:65, creativity:45, structure:85, leadership:55, social:50, independence:50, riskTolerance:60, collaboration:55, analytical:90 });
    Object.assign(skills, { analytical:90, verbal:60, quantitative:90, attentionToDetail:85, communication:60, creativity:35, technicalLiteracy:60 });
    Object.assign(lifestyle, { stressLevel:75, salaryPotential:85, workLifeBalance:35, jobSecurity:65, remoteWork:45, leadershipOpportunity:60 });
  }

  // Culinary / Hospitality
  if (t.some(x => ["culinary","hospitality"].includes(x))) {
    Object.assign(traits, { curiosity:65, creativity:80, structure:70, leadership:60, social:75, independence:45, riskTolerance:40, collaboration:70, analytical:35 });
    Object.assign(skills, { analytical:35, verbal:55, quantitative:40, attentionToDetail:75, communication:65, creativity:85, technicalLiteracy:25 });
    Object.assign(lifestyle, { stressLevel:70, salaryPotential:40, workLifeBalance:30, jobSecurity:55, remoteWork:10, leadershipOpportunity:55 });
  }

  // Startup / Entrepreneurship
  if (t.some(x => ["startup"].includes(x)) || ti.includes("entrepreneur") || ti.includes("founder")) {
    Object.assign(traits, { curiosity:85, creativity:80, structure:40, leadership:90, social:70, independence:85, riskTolerance:90, collaboration:65, analytical:70 });
    Object.assign(skills, { analytical:70, verbal:75, quantitative:65, attentionToDetail:55, communication:80, creativity:80, technicalLiteracy:65 });
    Object.assign(lifestyle, { stressLevel:85, salaryPotential:70, workLifeBalance:30, jobSecurity:20, remoteWork:60, leadershipOpportunity:95 });
  }

  // Quality Assurance
  if (t.some(x => ["quality"].includes(x))) {
    Object.assign(traits, { curiosity:60, creativity:40, structure:90, leadership:45, social:40, independence:55, riskTolerance:25, collaboration:55, analytical:80 });
    Object.assign(skills, { analytical:80, verbal:50, quantitative:65, attentionToDetail:95, communication:55, creativity:35, technicalLiteracy:70 });
    Object.assign(lifestyle, { stressLevel:60, salaryPotential:55, workLifeBalance:65, jobSecurity:70, remoteWork:65, leadershipOpportunity:40 });
  }

  // Leadership/Senior roles — boost leadership
  if (ti.includes("lead") || ti.includes("manager") || ti.includes("director") || ti.includes("head") || ti.includes("chief") || ti.includes("senior")) {
    traits.leadership = Math.min(95, traits.leadership + 15);
    lifestyle.leadershipOpportunity = Math.min(95, lifestyle.leadershipOpportunity + 15);
    lifestyle.salaryPotential = Math.min(95, lifestyle.salaryPotential + 10);
    lifestyle.stressLevel = Math.min(95, lifestyle.stressLevel + 10);
  }

  // Remote-friendly roles
  if (ti.includes("analyst") || ti.includes("writer") || ti.includes("researcher") || ti.includes("data")) {
    lifestyle.remoteWork = Math.min(90, lifestyle.remoteWork + 10);
  }

  return { traits, skills, lifestyle };
}

// ── Enrich each career ────────────────────────────────────────────────────────
const enriched = careers.map(c => {
  const { traits, skills, lifestyle } = getDefaults(c.tags || [], c.title || "");

  // Parse salary string to numeric potential
  const raw = String(c.salary || "0");
  const nums = raw.match(/\d+(\.\d+)?/g);
  if (nums) {
    const high = Math.max(...nums.map(Number));
    // Normalize to 0-100 (assume 40 LPA = 100)
    lifestyle.salaryPotential = Math.min(100, Math.round((high / 40) * 100));
  }

  return {
    ...c,
    requiredTraits: traits,
    requiredSkills: skills,
    lifestyleProfile: lifestyle,
    // Also store normalized stress/worklife directly for backwards compat
    stress: lifestyle.stressLevel,
    worklife: 100 - lifestyle.stressLevel, // inverse of stress
  };
});

// ── Write both files ──────────────────────────────────────────────────────────
const serverOut = path.join(__dirname, "data/careers.json");
fs.writeFileSync(serverOut, JSON.stringify(enriched, null, 2));
console.log(`✅ Wrote ${enriched.length} enriched careers → ${serverOut}`);

// Also write to frontend
const frontendOut = path.join(__dirname, "../careeriq/src/data/careers.json");
if (fs.existsSync(frontendOut)) {
  // Read the frontend file which may have more careers (150 vs 100)
  const frontendCareers = JSON.parse(fs.readFileSync(frontendOut, "utf8"));
  // Build a map of enriched data by id
  const enrichMap = {};
  enriched.forEach(c => { enrichMap[c.id] = { requiredTraits: c.requiredTraits, requiredSkills: c.requiredSkills, lifestyleProfile: c.lifestyleProfile, stress: c.stress, worklife: c.worklife }; });
  // Enrich frontend careers too (for any missing ones, compute on the fly)
  const frontendEnriched = frontendCareers.map(c => {
    if (enrichMap[c.id]) return { ...c, ...enrichMap[c.id] };
    // For careers 101-150, compute fresh
    const { traits, skills, lifestyle } = getDefaults(c.tags || [], c.title || "");
    const raw = String(c.salary || "0");
    const nums = raw.match(/\d+(\.\d+)?/g);
    if (nums) { const high = Math.max(...nums.map(Number)); lifestyle.salaryPotential = Math.min(100, Math.round((high / 40) * 100)); }
    return { ...c, requiredTraits: traits, requiredSkills: skills, lifestyleProfile: lifestyle, stress: lifestyle.stressLevel, worklife: 100 - lifestyle.stressLevel };
  });
  fs.writeFileSync(frontendOut, JSON.stringify(frontendEnriched, null, 2));
  console.log(`✅ Wrote ${frontendEnriched.length} enriched careers → ${frontendOut}`);
}
