import { writeFileSync } from "fs";
import path from "path";
import nodes from "./Nodes.js";

const __dirname = import.meta.dirname;
const classesDestination = "../src/CST.js";
const visitorDestination = "../src/Visitor.js";

let codeString = `
export default class Visitor {
`;
for (const node of Object.keys(nodes)) {
    codeString += `\tvisit${node}(node) {}\n`;
}
codeString += `}`;

writeFileSync(path.join(__dirname, visitorDestination), codeString);

codeString = `
import Node from '../src/Nodes.js';
`;
for (const [name, args] of Object.entries(nodes)) {
    codeString += `
export class ${name} extends Node {
    constructor(${args.join(', ')}) {
        super();
        ${args.map((arg) => `this.${arg} = ${arg};`).join('\n\t\t')}
    }

    accept(visitor) {
        return visitor.visit${name}(this);
    }
}
    `;
}

writeFileSync(path.join(__dirname, classesDestination), codeString);