const fs = require('fs');
const path = require('path');

const id = process.env.GA_MEASUREMENT_ID || '';
const out = path.join(__dirname, '..', 'analytics.config.js');
const contents = id
  ? "window.GA_MEASUREMENT_ID = '" + id.replace(/'/g, "\\'") + "';\n"
  : "window.GA_MEASUREMENT_ID = '';\n";

fs.writeFileSync(out, contents, 'utf8');
console.log(id ? 'Wrote analytics.config.js from GA_MEASUREMENT_ID' : 'Wrote empty analytics.config.js (GA disabled)');
