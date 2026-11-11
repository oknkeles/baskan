'use strict';
/* Node yükleyici: çekirdek modülleri (varsa) ve js/data/*.js dosyalarını tarayıcıdaki sırayla yükler.
 * Yüklenemeyen (ör. sözdizimi hatalı) dosya atlanır ve BG.__loadErrors'a yazılır; validate bunu hata sayar. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const CORE = ['ns', 'schema', 'engine', 'disaster', 'dialogue', 'election', 'opposition'];

/** only: verilirse yalnızca starter.js + bu veri dosyaları yüklenir. → BG */
exports.load = function (only) {
  delete globalThis.BG;
  const core = CORE.map(n => 'js/core/' + n + '.js').filter(f => fs.existsSync(path.join(ROOT, f)));
  const dir = path.join(ROOT, 'js/data');
  let data = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => 'js/data/' + f) : [];
  if (only && only.length) {
    const want = only.map(f => path.relative(ROOT, path.resolve(f)));
    data = data.filter(f => f === 'js/data/starter.js' || want.includes(f));
  }
  const errors = [];
  core.concat(data).forEach(f => {
    try { vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }); }
    catch (e) { errors.push(f + ': ' + (e && e.message)); console.error('ATLANDI ' + f + ' — ' + (e && e.message)); }
  });
  globalThis.BG.__loadErrors = errors;
  return globalThis.BG;
};
exports.ROOT = ROOT;
