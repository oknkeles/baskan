'use strict';
/* İçerik doğrulama.
 *   node tools/validate.js                    → tüm oyun (dosyalar arası başvurular dahil)
 *   node tools/validate.js js/data/dosya.js   → yalnızca çekirdek + starter + o dosya (eksik başvurular uyarı olur)
 */
const { load } = require('./load');
const files = process.argv.slice(2);
const BG = load(files);
const r = BG.schema.validateAll(files.length > 0);
(BG.__loadErrors || []).forEach(e => r.errors.push('Yüklenemedi → ' + e));
console.log('İçerik: ' + Object.keys(r.counts).map(k => k + '=' + r.counts[k]).join(', '));
r.warnings.forEach(w => console.log('UYARI  ' + w));
r.errors.forEach(e => console.log('HATA   ' + e));
console.log(r.errors.length ? r.errors.length + ' hata' : 'Tamam: hata yok');
process.exit(r.errors.length ? 1 : 0);
