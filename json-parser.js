const fs = require('fs')
const path = require('path')
const file = fs.readFileSync(path.join(__dirname,'./file.json')).toString()

const numRE = /^[-+]?\d+\.?\d+([e][-+]?\d+)?/
const boolRE = /(^true|^false)/
const spaceRE = /^(\s)+/

const nullParser = function(input){
    if(input.slice(0,4) != 'null'){
        return null
    }
    return [null, input.slice(4)]
}

const booleanParser = function(input){
    let bool = boolRE.exec(input)
    if(!bool){
        return null
    }
    return [bool[0], input.slice(bool[0].length)]
}

const numberParser = function(input){
    let string = numRE.exec(input)
    if(!string){
        return null
    }
    let number = parseInt(string[0])
    let length = string[0].length
    return [number, input.slice(length)]
}

const stringParser = function(input){
    if (input[0] != '"'){
        return null
    }
    input = input.slice(1)
    let EoS = input.indexOf('"')
    let string = input.slice(0, EoS).toString()
    return [string, input.slice(EoS+1)]
}

const spaceParser = function(input){
    let temp = spaceRE.exec(input)
    if(!temp){
        return input
    }
    input = input.replace(spaceRE, '')
    return input
}

const commaParser = function(input){
    input = spaceParser(input)
    if(input[0] != ','){
        return null
    }
    return [', ', input.slice(1)]
}

const arrayParser = function(input){
    if(input[0] != '['){
        return null
    }
    input = input.slice(1)
    let result, outputArray = []
    while(input[0] != ']'){
        result = valueParser(input)
        outputArray.push(result[0])
        input = result[1]

        result = commaParser(input)
        if(!result)
            break
        input = result[1]
    }
    return [outputArray, input.slice(1)]
}

const colonParser = function(input){
    input = spaceParser(input)
    if(input[0] != ':')
        return null
    return [':', input.slice(1)]
}

const objectParser = function(input){
    if(input[0] != '{')
        return null
    input = input.slice(1)
    let outputObject = {}, result = null

    while(input[0] != '}'){
        input = spaceParser(input)
        if(input[0] == '}')
            break

        result = stringParser(input)
        let key = result[0]
        input = result[1]

        result = colonParser(input)
        input = result[1]

        result = valueParser(input)
        let value = result[0]
        input = result[1]

        outputObject[key] = value //store in object

        result = commaParser(input)
        if(!result)
            break
        input = result[1]
    }
    return [outputObject, input.slice(1)]
}

const valueParser = function(input){
    input = spaceParser(input)
    let result
    if(result = nullParser(input))
        return result
    if(result = objectParser(input))
        return result
    if(result = arrayParser(input))
        return result
    if(result = booleanParser(input))
        return result
    if(result = stringParser(input))
        return result
    if(result = numberParser(input))
        return result
    if (input != '')
        return null
}

let getParsed = objectParser(file)
if(getParsed){
    let temp = JSON.stringify(getParsed[0], null, 4)
    console.log(temp)
}
else {
    console.log("Invalid input")
}
