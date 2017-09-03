const fs = require('fs')
const path = require('path')
const file = fs.readFileSync(path.join(__dirname,'./file.json')).toString()

const numRE = /^([-+]?\d+\.?\d?([e][-+]?\d+)?)/
let getParsed, temp= null

const nullParser = function(input){
    return input.slice(0,4) === 'null' ? [null, input.slice(4)] : null
}

const booleanParser = function(input){
    let bool = /(^true|^false)/.exec(input)
    if(!bool) return null
    return bool[0] === 'true' ? [true, input.slice(bool[0].length)] : [false, input.slice(bool[0].length)]
}

const numberParser = function(input){
    let string = numRE.exec(input)
    return string ? [parseFloat(string[0]), input.slice(string[0].length)] : null
}

const stringParser = function(input){
    if (input[0] != '"') return null
    input = input.slice(1)
    let EoS = input.indexOf('"')
    let string = input.slice(0, EoS).toString()
    return [string, input.slice(EoS+1)]
}

const spaceParser = function(input){
    let temp = /^(\s)+/.exec(input)
    if(!temp) return input
    input = input.replace(/^(\s)+/, '')
    return input
}//change signature

const commaParser = function(input){
    input = spaceParser(input)
    return input[0] === ',' ? [',', input.slice(1)] : null
}

const arrayParser = function(input){
    if(input[0] != '[') return null
    input = input.slice(1)
    let result, outputArray = []
    while(input[0] != ']'){
        result = valueParser(input) //value
        outputArray.push(result[0])
        input = result[1]
        result = commaParser(input) //comma
        if(!result) break
        input = result[1]
    }
    return [outputArray, input.slice(1)]
}

const colonParser = function(input){
    input = spaceParser(input)
    return input[0] === ':' ? [':', input.slice(1)] : null
}

const objectParser = function(input){
    if(input[0] != '{') return null
    input = input.slice(1)
    let outputObject = {}, result = null
    while(input[0] != '}'){
        input = spaceParser(input)
        if(input[0] == '}') break
        result = stringParser(input) //key
        let key = result[0]
        input = result[1]
        result = colonParser(input) //colon
        input = result[1]
        result = valueParser(input) //value
        let value = result[0]
        input = result[1]
        outputObject[key] = value //store in object
        result = commaParser(input) //end of object
        if(!result) break
        input = result[1]
    }
    return [outputObject, input.slice(1)]
}

const valueParser = function(input){
    input = spaceParser(input)
    let result
    if(result = (nullParser(input) || objectParser(input) || arrayParser(input) || booleanParser(input) || stringParser(input) || numberParser(input)))
        return result
    if (input != '')
        return null
}//make different fxn

try{
    getParsed = objectParser(file)
    temp = JSON.stringify(getParsed[0], null, 4)
}
catch(err){
    temp = 'Invalid JSON' //redundant
}
if(!temp)
    temp = 'Invalid JSON'
console.log(temp)
// map filter reduce
