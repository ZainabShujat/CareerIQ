require('dotenv').config();
const mongoose = require('mongoose');
const Career = require('./models/Career');
const Test = require('./models/Test');

const sampleCareers = [
  { id: 'se', title: 'Software Engineer', slug: 'software-engineer', salary:'₹8–20 LPA', short:'Build software and systems', tags:['tech','software'], skills:['programming','algorithms']},
  { id: 'ds', title: 'Data Scientist', slug: 'data-scientist', salary:'₹6–30 LPA', short:'Analyze data and build models', tags:['data','ml'], skills:['python','statistics']},
  { id: 'ux', title: 'UX Designer', slug: 'ux-designer', salary:'₹4–15 LPA', short:'Design user experiences', tags:['design'], skills:['research','visual-design']},
  { id: 'chef', title: 'Chef', slug: 'chef', salary:'₹3–12 LPA', short:'Create culinary experiences', tags:['hospitality'], skills:['cooking','time-management']},
  { id: 'doctor', title: 'Doctor', slug: 'doctor', salary:'₹10–40 LPA', short:'Diagnose and treat patients', tags:['healthcare'], skills:['medicine','diagnosis']},
  { id: 'teacher', title: 'Teacher', slug: 'teacher', salary:'₹2–10 LPA', short:'Educate students and mentors', tags:['education'], skills:['communication','lesson-planning']}
];

// expand to 100 by cloning with suffix numbers
function makeCareers() {
  const out = [];
  for (let i=0;i<100;i++){
    const base = sampleCareers[i % sampleCareers.length];
    const idx = i+1;
    out.push({
      id: base.id + '-' + idx,
      title: `${base.title}${i===0 ? '' : ' #' + idx}`,
      slug: `${base.slug}-${idx}`,
      salary: base.salary,
      short: base.short,
      tags: base.tags,
      skills: base.skills,
      long: `Long description for ${base.title} (example copy). Responsibilities, skills, and typical career path.`
    });
  }
  return out;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing careers & tests...');
  await Career.deleteMany({});
  await Test.deleteMany({});

  const careers = makeCareers();
  await Career.insertMany(careers);
  console.log('Inserted', careers.length, 'careers');

  // create a few sample 5-question tests
  const sampleTest = {
    id: 'skill-coding',
    title: 'Coding Skill Test (5 q)',
    type: 'skill',
    questions: []
  };
  for (let i=1;i<=5;i++){
    sampleTest.questions.push({
      id: `q${i}`,
      text: `Sample coding question ${i}`,
      choices: [
        { id: 'a', text: 'Option A', score: 0 },
        { id: 'b', text: 'Option B', score: 1 },
        { id: 'c', text: 'Option C', score: 2 }
      ]
    });
  }

  await Test.create(sampleTest);
  await Test.create({ ...sampleTest, id: 'skill-english', title: 'Communication (5 q)'});
  await Test.create({ ...sampleTest, id: 'personality', type:'personality', title:'Personality (24 q)', questions: sampleTest.questions });

  console.log('Sample tests inserted');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
