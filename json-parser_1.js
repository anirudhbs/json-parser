const fs = require('fs')
const path = require('path')
const ancestry = fs.readFileSync(path.join(__dirname,'./ancestry.json')).toString()

const numRE = /\d+/
const boolRE = /(^true|^false)/
const spaceRE = /^(\s)+/

const nullParser = function(input){
    input = spaceParser(input)
    if(input.slice(0,4) != 'null'){
        return null
    }
    return [null, input.slice(4)]
}

const booleanParser = function(input){
    input = spaceParser(input)
    let bool = boolRE.exec(input)
    if(!bool){
        return null
    }
    return [bool[0], input.slice(bool[0].length)]
}

const numberParser = function(input){
    input = spaceParser(input)
    let string = numRE.exec(input)
    if(!string){
        return null
    }
    let number = string[0]
    let length = string[0].length
    return [number, input.slice(length)]
}

const stringParser = function(input){
    input = spaceParser(input)
    if (input[0] != '"'){
        return null
    }
    input = input.slice(1)
    let EoS = input.indexOf('"')
    let string = input.slice(0, EoS)
    return [string, input.slice(EoS+1)]
}

const spaceParser = function(input){
    let temp = spaceRE.exec(input)
    if(!temp)
        return input
    input = input.replace(spaceRE, '')
    return input
}

const valueParser = function(input){
    let result
    if(result = nullParser(input))
        return result
    if(result = booleanParser(input))
        return result
    if(result = stringParser(input))
        return result
    if(result = numberParser(input))
        return result

    return null
}

let getParsed = valueParser(ancestry)
console.log(getParsed)
