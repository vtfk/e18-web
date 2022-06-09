export function getRandomNumber (min = 0, max = 10) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getRandomHex (count = 1) {
  const hex = []
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * (15 - 0 + 1) + 0)
    if (num < 10) hex.push(num)
    else hex.push(String.fromCharCode(num + 87))
  }

  return hex.join('')
}

export function getRandomBoolean () {
  return getRandomNumber(0, 1) === 1
}

export function getDate (num = 0) {
  const d = new Date()
  return new Date(d.setDate(d.getDate() - num)).toISOString()
}
