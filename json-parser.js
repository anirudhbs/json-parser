const fs = require('fs')
const path = require('path')
const file = fs.readFileSync(path.join(__dirname,'./twitter.json')).toString()
let temp = null

const nullParser = function(input){
    return input.slice(0,4) === 'null' ? [null, input.slice(4)] : null
}

const booleanParser = function(input){
    let bool = /(^true|^false)/.exec(input)
    if(!bool) return null
    return bool[0] === 'true' ? [true, input.slice(bool[0].length)] : [false, input.slice(bool[0].length)]
}

const numberParser = function(input){
    let string = /^([-+]?\d+\.?\d?([e][-+]?\d+)?)/.exec(input)
    return string ? [parseFloat(string[0]), input.slice(string[0].length)] : null
}

const stringParser = function(input){
    if (input[0] !== '"') return null
    input = input.slice(1)
    input = input.replace(/\\"/, '\'') //fix this
    let EoS = input.indexOf('"')
    let string = input.slice(0, EoS).toString()
    return [string, input.slice(EoS+1)]
}

const spaceParser = function(input){
    return /^(\s)+/.exec(input) ? input.replace(/^(\s)+/, '') : input
}

const commaParser = function(input){
    return input[0] === ',' ? input.slice(1) : input

}

const arrayParser = function(input){
    if(input[0] !== '[') return null
    input = input.slice(1)
    let result, outputArray = []
    while(input[0] !== ']'){
        result = valueParser(input) //value
        outputArray.push(result[0])
        input = commaParser(spaceParser(result[1])) //comma
        input = spaceParser(input) //testing
    }
    return [outputArray, input.slice(1)]
}

const keyParser = function(input){
    return stringParser(input)
}

const colonParser = function(input){
    return input[0] === ':' ? input.slice(1) : input
}

const objectParser = function(input){
    if(input[0] !== '{') return null
    input = input.slice(1)
    let outputObject = {}, result = null
    while(input[0] != '}'){
        input = spaceParser(input)
        if(input[0] == '}') break
        result = keyParser(input) //key
        let key = result[0]
        input = result[1]
        input = colonParser(spaceParser(input)) //colon
        result = valueParser(input) //value
        let value = result[0]
        input = result[1]
        outputObject[key] = value //store in object
        input = commaParser(spaceParser(input))
    }
    return [outputObject, input.slice(1)]
}

const valueParser = function(input){
    input = spaceParser(input)
    let result
    if(result = (nullParser(input) || booleanParser(input) || stringParser(input) || numberParser(input) || arrayParser(input) || objectParser(input)))
        return result
    return null
}

try{
    let getParsed = valueParser(file)
    temp = JSON.stringify(getParsed[0], null, 4)
}catch(err){
    temp = 'Invalid JSON'
}

if(!temp) temp = 'Invalid JSON'
console.log(temp)
