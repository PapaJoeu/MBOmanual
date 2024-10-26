// Gap settings table data
const gapSettingsTable = [
    { sheetLength: 6, set1: 20, set2: 10 },
    { sheetLength: 8, set1: 25, set2: 12 },
    { sheetLength:10, set1: 30, set2:15 },
    { sheetLength:12, set1:35, set2:18 },
    { sheetLength:14, set1:40, set2:20 },
    { sheetLength:16, set1:45, set2:24 },
    { sheetLength:18, set1:50, set2:27 },
    { sheetLength:20, set1:55, set2:30 },
    { sheetLength:22, set1:60, set2:30 },
    { sheetLength:24, set1:65, set2:30 },
    { sheetLength:26, set1:70, set2:30 },
    { sheetLength:28, set1:75, set2:30 },
    { sheetLength:30, set1:80, set2:30 },
    { sheetLength:32, set1:87, set2:33 },
    { sheetLength:34, set1:92, set2:33 },
    { sheetLength:36, set1:98, set2:33 },
    { sheetLength:38, set1:104,set2:33 },
    { sheetLength:40, set1:110,set2:35 },
    { sheetLength:42, set1:115,set2:35 },
    { sheetLength:44, set1:120,set2:35 },
    { sheetLength:46, set1:125,set2:35 },
    { sheetLength:48, set1:130,set2:35 },
    { sheetLength:50, set1:135,set2:35 },
    { sheetLength:52, set1:140,set2:35 }
];

function calculateSettings() {
    const foldType = document.getElementById('foldType').value;
    let sheetLength = parseFloat(document.getElementById('sheetLength').value);
    const unit = document.getElementById('unit').value;

    if (isNaN(sheetLength) || sheetLength <= 0) {
        alert('Please enter a valid sheet length.');
        return;
    }

    // Convert mm to inches if necessary
    if (unit === 'mm') {
        sheetLength /= 25.4;
    }

    // Calculate Gap Settings using interpolation
    const gapSetting = interpolateGapSettings(sheetLength);

    // Round up to nearest whole number
    const gapSet1 = Math.ceil(gapSetting.set1);
    const gapSet2 = Math.ceil(gapSetting.set2);

    // Prepare results
    let caliperSettings = [];
    let sheetStops = [];

    if (foldType === 'bifold') {
        caliperSettings = [
            { caliper: '1', sheetsThick: '1' },
            { caliper: '2', sheetsThick: '2' },
            { caliper: '3', sheetsThick: '2' },
            { caliper: '4', sheetsThick: '2' },
            { caliper: '5', sheetsThick: '2' },
            { caliper: '6', sheetsThick: '2' }
        ];

        const stop1Decimal = sheetLength * 0.5;
        const stop1Simplified = toNearestSixteenth(stop1Decimal);

        sheetStops = [
            { stopper: '1', measurement: stop1Decimal.toFixed(2), simplified: stop1Simplified },
            { stopper: '2', measurement: 'Deflector', simplified: '' },
            { stopper: '3', measurement: 'Deflector', simplified: '' },
            { stopper: '4', measurement: 'Deflector', simplified: '' }
        ];
    } else if (foldType === 'trifold') {
        caliperSettings = [
            { caliper: '1', sheetsThick: '1' },
            { caliper: '2', sheetsThick: '1' },
            { caliper: '3', sheetsThick: '3' },
            { caliper: '4', sheetsThick: '3' },
            { caliper: '5', sheetsThick: '3' },
            { caliper: '6', sheetsThick: '3' }
        ];

        const stop1Decimal = sheetLength * (2/3);
        const stop2Decimal = sheetLength * (1/3);
        const stop1Simplified = toNearestSixteenth(stop1Decimal);
        const stop2Simplified = toNearestSixteenth(stop2Decimal);

        sheetStops = [
            { stopper: '1', measurement: stop1Decimal.toFixed(2), simplified: stop1Simplified },
            { stopper: '2', measurement: stop2Decimal.toFixed(2), simplified: stop2Simplified },
            { stopper: '3', measurement: 'Deflector', simplified: '' },
            { stopper: '4', measurement: 'Deflector', simplified: '' }
        ];
    } else if (foldType === 'zfold') {
        caliperSettings = [
            { caliper: '1', sheetsThick: '1' },
            { caliper: '2', sheetsThick: '1' },
            { caliper: '3', sheetsThick: '3' },
            { caliper: '4', sheetsThick: '3' },
            { caliper: '5', sheetsThick: '3' },
            { caliper: '6', sheetsThick: '3' }
        ];

        const stop1Decimal = sheetLength * (1/3);
        const stop3Decimal = sheetLength * (1/3);
        const stop1Simplified = toNearestSixteenth(stop1Decimal);
        const stop3Simplified = toNearestSixteenth(stop3Decimal);
        sheetStops = [
            { stopper: '1', measurement: stop1Decimal.toFixed(2), simplified: stop1Simplified },
            { stopper: '2', measurement: 'Deflector', simplified: '' },
            { stopper: '3', measurement: stop3Decimal.toFixed(2), simplified: stop3Simplified },
            { stopper: '4', measurement: 'Deflector', simplified: '' }
        ];
    }

    // Display results
    document.getElementById('caliperSettings').innerHTML = caliperSettings.map(item => `
        <tr>
            <td>${item.caliper}</td>
            <td>${item.sheetsThick}</td>
        </tr>
    `).join('');

    document.getElementById('sheetStops').innerHTML = sheetStops.map(item => `
        <tr>
            <td>${item.stopper}</td>
            <td>${item.measurement}</td>
            <td>${item.simplified}</td>
        </tr>
    `).join('');

    document.getElementById('gapSetting').innerHTML = `
        Set 1: ${gapSet1}<br>
        Set 2: ${gapSet2}
    `;

    document.getElementById('results').style.display = 'block';
}

// Function to interpolate gap settings
function interpolateGapSettings(sheetLength) {
    const table = gapSettingsTable;
    let lower = null;
    let upper = null;

    // Find the two closest entries in the table
    for (let i = 0; i < table.length; i++) {
        if (sheetLength === table[i].sheetLength) {
            return { set1: table[i].set1, set2: table[i].set2 };
        } else if (sheetLength < table[i].sheetLength) {
            upper = table[i];
            lower = table[i - 1] || table[0];
            break;
        }
    }

    if (!upper) {
        // Sheet length is larger than any in the table
        lower = table[table.length - 2];
        upper = table[table.length - 1];
    }

    // Linear interpolation
    const ratio = (sheetLength - lower.sheetLength) / (upper.sheetLength - lower.sheetLength);
    const set1 = lower.set1 + ratio * (upper.set1 - lower.set1);
    const set2 = lower.set2 + ratio * (upper.set2 - lower.set2);

    return { set1, set2 };
}

// Function to convert decimal inches to nearest 1/16 inch
function toNearestSixteenth(value) {
    const inches = Math.floor(value);
    const fraction = value - inches;
    const sixteen = Math.round(fraction * 16);
    let numerator = sixteen;
    const denominator = 16;

    // Simplify the fraction
    function gcd(a, b) {
        if (b === 0) return a;
        return gcd(b, a % b);
    }

    const gcdValue = gcd(numerator, denominator);
    numerator /= gcdValue;
    const simplifiedDenominator = denominator / gcdValue;

    let fractionString = '';
    if (numerator === 0) {
        fractionString = '';
    } else if (simplifiedDenominator === 1) {
        // Whole number
        fractionString = '';
        inches += 1;
    } else {
        fractionString = `${numerator}/${simplifiedDenominator}`;
    }

    let result = '';
    if (inches > 0 && fractionString !== '') {
        result = `${inches} ${fractionString}"`;
    } else if (inches > 0) {
        result = `${inches}"`;
    } else if (fractionString !== '') {
        result = `${fractionString}"`;
    } else {
        result = '0"';
    }

    return result;
}