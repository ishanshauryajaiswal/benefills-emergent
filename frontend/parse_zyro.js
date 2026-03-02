const fs = require('fs');
const html = fs.readFileSync('/tmp/shop.html', 'utf8');

// The JSON data usually resides inside a script tag like: window.zyroStoreContext = {...}
// Or window.__INITIAL_STATE__

const stateRegex = /window\.zyroStoreContext\s*=\s*(\{.*?\});/g;
let match = stateRegex.exec(html);

if (match) {
    const data = JSON.parse(match[1]);
    console.log(Object.keys(data));
    fs.writeFileSync('zyroData.json', JSON.stringify(data, null, 2));
} else {
    console.log("zyroStoreContext not found. Trying another pattern.");
    // Maybe window.vuex or something...
    const patterns = [
        /window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/g,
        /window\.jsData\s*=\s*(\{.*?\});/g
    ]
    for (const p of patterns) {
        let m = p.exec(html);
        if (m) {
            console.log("Found another state object.");
            fs.writeFileSync('zyroData.json', m[1]);
            return;
        }
    }
}
