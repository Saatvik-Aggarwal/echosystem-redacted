function convertToJSDate(hourFloat) {
  // Convert hours to milliseconds
  const milliseconds = hourFloat * 60 * 60 * 1000;
  // Create a new Date object for today
  const date = new Date();
  // Set the time to the calculated milliseconds
  date.setHours(0, 0, 0, 0); // Reset to midnight
  date.setMilliseconds(milliseconds);
  return date;
}

// Example usage
const seagullActiveTime = convertToJSDate(6.0);
const woodpeckerActiveTime = convertToJSDate(6.0);
const blackRedstartActiveTime = convertToJSDate(6.0);
const americanGoldfinchActiveTime = convertToJSDate(6.0);
const baldEagleActiveTime = convertToJSDate(9.0);
const canadaGeeseActiveTime = convertToJSDate(6.0);

console.log("Seagull active time:", seagullActiveTime.toLocaleTimeString());
console.log("Woodpecker active time:", woodpeckerActiveTime.toUTCString());
console.log(
  "Black Redstart active time:",
  blackRedstartActiveTime.toLocaleTimeString()
);
console.log(
  "American Goldfinch active time:",
  americanGoldfinchActiveTime.toLocaleTimeString()
);
console.log(
  "Bald Eagle active time:",
  baldEagleActiveTime.toLocaleTimeString()
);
console.log(
  "Canada Geese active time:",
  canadaGeeseActiveTime.toLocaleTimeString()
);
