// DJB2 Hash Algorithm
// Returns a value from 0 to n - 1
function dateTextToNumberDJB2(date, textStr, n) {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getYear();

    const combined = `${day}_${month}_${year}_${textStr}`;
    let hash = 5381;
    
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    }
    
    return (Math.abs(hash) % n);
}

// Test function for dateTextToNumberDJB2
function testDateTextToNumberDJB2() {
    const results = [];
    const n = 100;
    const text = 'sample';
    const today = new Date();
    for (let i = 0; i < 100; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const value = dateTextToNumberDJB2(date, text, n);
        results.push({ date: date, value });
    }
    return results;
}

// const results = testDateTextToNumberDJB2();
// console.log(results);
// console.log(results.sort((a,b) => a.value - b.value));

export default dateTextToNumberDJB2;