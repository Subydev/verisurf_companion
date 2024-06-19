const props = { decimal_places: 3 }; // Adjust decimal places as needed

const generateRandomValue = () => {
  return (Math.random() * (0.004 + 0.015) - 0.015).toFixed(props.decimal_places);
};

const smoothTransition = (start, end, duration, callback) => {
  const steps = duration / 500; // Number of steps in the transition
  const stepSize = (end - start) / steps;
  let currentStep = 0;

  const intervalId = setInterval(() => {
    if (currentStep < steps) {
      const newValue = (parseFloat(start) + stepSize * currentStep).toFixed(props.decimal_places);
      callback(newValue);
      currentStep++;
    } else {
      clearInterval(intervalId);
      callback(end.toFixed(props.decimal_places));
    }
  }, 500);
};

let randomX = generateRandomValue();
let randomY = generateRandomValue();
let randomZ = generateRandomValue();

const updateValues = () => {
  const newRandomX = generateRandomValue();
  const newRandomY = generateRandomValue();
  const newRandomZ = generateRandomValue();

  smoothTransition(randomX, newRandomX, 5000, (value) => { randomX = value; });
  smoothTransition(randomY, newRandomY, 5000, (value) => { randomY = value; });
  smoothTransition(randomZ, newRandomZ, 5000, (value) => { randomZ = value; });

  const randomD3 = Math.sqrt(randomX ** 2 + randomY ** 2 + randomZ ** 2).toFixed(props.decimal_places);
  console.log({ randomX, randomY, randomZ, randomD3 });
};

setInterval(updateValues, 500); // Update values every 500ms

// Initial log
console.log({ randomX, randomY, randomZ, randomD3: Math.sqrt(randomX ** 2 + randomY ** 2 + randomZ ** 2).toFixed(props.decimal_places) });
