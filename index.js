const fs = require('fs')
const path = require('path')

function nullParser (input) {
  return input.slice(0, 4) === 'null' ? [null, input.slice(4)] : null
}

function booleanParser (input) {
  let bool = /(^true|^false)/.exec(input)
  if (!bool) return null
  return bool[0] === 'true' ? [true, input.slice(bool[0].length)] : [false, input.slice(bool[0].length)]
}

function numberParser (input) {
  let string = /^([-+]?\d+\.?\d?([e][-+]?\d+)?)/.exec(input)
  return string ? [parseFloat(string[0]), input.slice(string[0].length)] : null
}

function stringParser (input) {
  if (input[0] !== '"') return null
  input = input.slice(1)
  let EoS = /"[,\]:}\n]/.exec(input).index // (?:\\\"|")*
  let string = input.slice(0, EoS).toString()
  return [string, input.slice(EoS + 1)]
}

function spaceParser (input) {
  return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

function commaParser (input) {
  return input[0] === ',' ? input.slice(1) : input
}

function arrayParser (input) {
  if (input[0] !== '[') return null
  input = input.slice(1)
  let result
  const array = []
  while (input[0] !== ']') {
    result = valueParser(spaceParser(input)) // value
    array.push(result[0])
    input = commaParser(spaceParser(result[1])) // comma
    input = spaceParser(input) // test
  }
  return [array, input.slice(1)]
}

function keyParser (input) {
  return stringParser(input)
}

function colonParser (input) {
  return input[0] === ':' ? input.slice(1) : input
}

function objectParser (input) {
  if (input[0] !== '{') return null
  input = input.slice(1)
  const outputObject = {}
  let result = null
  while (input[0] !== '}') {
    input = spaceParser(input)
    if (input[0] === '}') break
    result = keyParser(input) // key
    let key
    [key, input] = result
    input = colonParser(spaceParser(input)) // colon
    result = valueParser(spaceParser(input)) // value
    let value
    [value, input] = result
    outputObject[key] = value // store in object
    input = commaParser(spaceParser(input))
  }
  return [outputObject, input.slice(1)]
}

function valueParser (input) {
  const result = (nullParser(input) || booleanParser(input) || stringParser(input) ||
    numberParser(input) || arrayParser(input) || objectParser(input))
  if (result) {
    return result
  }
  return null
}

const file = fs.readFileSync(path.join(__dirname, './' + process.argv[2])).toString()
let temp = null

try {
  let getParsed = valueParser(file)
  temp = JSON.stringify(getParsed[0], null, 4)
} catch (err) {
  temp = 'Invalid JSON'
}
if (!temp) temp = 'Invalid JSON'
console.log(temp)
