// seedCareersLocal.js
const fs = require('fs');
const path = require('path');

const tagsPool = [
  ["engineering"],
  ["data"],
  ["design"],
  ["medical"],
  ["teaching"],
  ["culinary"],
  ["business"],
  ["engineering","data"],
  ["engineering","product"],
  ["civil"]
];

const titles = [
  "Software Engineer","Data Scientist","UX Designer","Mechanical Engineer",
  "Civil Engineer","Product Manager","Doctor","Chef","Teacher","Data Engineer"
];

const arr = [];
for(let i=1;i<=100;i++){
  const base = titles[(i-1) % titles.length];
  const title = `${base}${i>10 ? " " + i : ""}`;
  const slug = title.toLowerCase().replace(/[^\w]+/g,'-') + "-" + i;
  arr.push({
    id: "c" + i,
    slug,
    title,
    salary: `₹${3 + (i % 10)}–${7 + (i % 20)} LPA`,
    short: `Short description for ${title}`,
    long: `Long description for ${title}. This is generated to populate UI.`,
    tags: tagsPool[i % tagsPool.length],
    skills: ["communication","problem solving"]
  });
}

const out = path.join(__dirname, 'careers-100.json');
fs.writeFileSync(out, JSON.stringify(arr, null, 2), 'utf8');
console.log("Wrote", out);
