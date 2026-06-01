const date = new Date();
const day = date.getUTCDate();
const month = date.getUTCMonth();
const endDate = `${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate() + 6}`;
console.log(date);
console.log(endDate);