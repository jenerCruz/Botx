const fs = require('fs');
const path = require('path');
const handler = require('../bot/handler');

function loadModules() {
  const modulesDir = path.join(__dirname, '../modules');
  const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.js') && f !== 'loader.js');
  
  for (const file of files) {
    const module = require(path.join(modulesDir, file));
    if (module.command && module.handle) {
      handler.register(module.command, module.handle.bind(module));
      console.log(`Loaded module: ${module.name || module.command}`);
    }
  }
}

module.exports = { loadModules };