const fs = require('fs')
const path = require('path')
const ancestry = fs.readFileSync(path.join(__dirname,'./ancestry.json')).toString()
const RegEx = /\d+\.{0,1}\d*/

let parseNumber = function (input){
    let string = RegEx.exec(input)
    if(string) {
        let size = string.index + string[0].length
        let number = string[0]
        return [number, input.slice(size)]
    }
  return null
}

let getParsed = parseNumber(ancestry)
console.log(getParsed)
