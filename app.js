const diceCount = document.querySelector('#dice-count');
const sidesCount = document.querySelector('#sides-count');
const diceCountValue = document.querySelector('#dice-count-value');
const sidesCountValue = document.querySelector('#sides-count-value');
const targetValue = document.querySelector('#target-value');
const targetProbability = document.querySelector('#target-probability');
const sampleSize = document.querySelector('#sample-size');
const rangeLabel = document.querySelector('#range-label');
const chart = document.querySelector('#chart');
const rollButton = document.querySelector('#roll-button');
const lastRoll = document.querySelector('#last-roll');
const resultCaption = document.querySelector('#result-caption');
const resultTotal = document.querySelector('#result-total');
const rollHistory = document.querySelector('#roll-history');
const clearTarget = document.querySelector('#clear-target');

let history = [];

function calculateDistribution(count, sides) {
  let distribution = [1];
  for (let die = 0; die < count; die += 1) {
    const next = Array(distribution.length + sides - 1).fill(0);
    distribution.forEach((ways, currentSum) => {
      for (let face = 1; face <= sides; face += 1) next[currentSum + face] += ways;
    });
    distribution = next;
  }
  return distribution;
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function render() {
  const count = Number(diceCount.value);
  const sides = Number(sidesCount.value);
  const target = Number(targetValue.value);
  const distribution = calculateDistribution(count, sides);
  const totalOutcomes = sides ** count;
  const min = count;
  const max = count * sides;
  const peak = Math.max(...distribution);

  diceCountValue.textContent = count;
  sidesCountValue.textContent = sides;
  sampleSize.textContent = totalOutcomes.toLocaleString('en-US');
  rangeLabel.textContent = `${min} — ${max}`;
  targetValue.min = min;
  targetValue.max = max;
  if (target < min) targetValue.value = min;
  if (target > max) targetValue.value = max;

  chart.innerHTML = distribution.map((ways, index) => {
    const sum = min + index;
    const percent = (ways / totalOutcomes) * 100;
    const isTarget = sum === Number(targetValue.value);
    return `<div class="bar-wrap"><div class="bar${isTarget ? ' is-target' : ''}" style="height: ${(ways / peak) * 100}%"><span class="bar-value">${formatPercent(percent)}</span></div><span class="bar-label">${sum}</span></div>`;
  }).join('');

  const targetIndex = Number(targetValue.value) - min;
  const targetWays = distribution[targetIndex] || 0;
  targetProbability.textContent = formatPercent((targetWays / totalOutcomes) * 100);
}

function step(input, direction) {
  const nextValue = Number(input.value) + direction;
  const min = Number(input.min);
  const max = Number(input.max);
  input.value = Math.min(max, Math.max(min, nextValue));
  input.dispatchEvent(new Event('input'));
}

function rollDice() {
  const count = Number(diceCount.value);
  const sides = Number(sidesCount.value);
  const results = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = results.reduce((sum, value) => sum + value, 0);
  const target = Number(targetValue.value);
  const hit = total === target;

  lastRoll.innerHTML = results.map(value => `<span class="die-face">${value}</span>`).join('');
  resultCaption.textContent = hit ? '命中目標！' : `距離目標 ${Math.abs(total - target)} 點`;
  resultTotal.textContent = `總和 ${total}`;
  history.unshift(total);
  history = history.slice(0, 7);
  rollHistory.innerHTML = history.map(value => `<span class="history-item">${value} 點</span>`).join('');
  rollButton.classList.remove('rolling');
  void rollButton.offsetWidth;
  rollButton.classList.add('rolling');
}

document.querySelectorAll('input[type="range"]').forEach(input => input.addEventListener('input', render));
targetValue.addEventListener('input', render);
document.querySelectorAll('.step-button').forEach(button => button.addEventListener('click', () => {
  step(document.querySelector(`#${button.dataset.target}`), button.dataset.action === 'increase' ? 1 : -1);
}));
rollButton.addEventListener('click', rollDice);
clearTarget.addEventListener('click', () => {
  targetValue.value = '';
  render();
});
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
    event.preventDefault();
    rollDice();
  }
});
render();
