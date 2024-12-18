import { writeFileSync } from "fs";
import path from "path";
import nodes from "./Nodes.js";

const __dirname = import.meta.dirname;
const classesDestination = "../src/CST.js";
const visitorDestination = "../src/Visitor.js";

let codeString = `
import Node from "./Nodes.js";
class Visitor{
`
for (const node of Object.keys(nodes)){
    codeString += `\tvisit${node}(node) {throw new Error("Method 'visit${node}' must be implemented.");}\n`
}
codeString += `} \n export default Visitor;`


writeFileSync(path.join(__dirname, visitorDestination), codeString);

function printArgs(args, separator){
    const argKeys = Object.keys(args);
    return argKeys.map((arg)=>{
        return `${arg}`
    })
    .join(separator);
}

codeString = `import Node from "../src/Nodes.js";`

for(const [name, args] of Object.entries(nodes)){
    const argKeys = Object.keys(args);
    codeString += 
`
export class ${name} extends Node{
    constructor(${printArgs(args, ", ")}) {
        ${argKeys.map((arg)=> `this.${arg} = ${arg};`).join("\n\t\t")}
    }

    accept(visitor){
        return visitor.visit${name}(this);
    }
}\n\n`
}

writeFileSync(path.join(__dirname, classesDestination), codeString);