
import Node from "./Nodes.js";
class Visitor{
	visitRule(node) {throw new Error("Method 'visitRule' must be implemented.");}
	visitChoice(node) {throw new Error("Method 'visitChoice' must be implemented.");}
	visitConcatenation(node) {throw new Error("Method 'visitConcatenation' must be implemented.");}
	visitPluck(node) {throw new Error("Method 'visitPluck' must be implemented.");}
	visitLabel(node) {throw new Error("Method 'visitLabel' must be implemented.");}
	visitExpression(node) {throw new Error("Method 'visitExpression' must be implemented.");}
	visitQuantifier(node) {throw new Error("Method 'visitQuantifier' must be implemented.");}
	visitParsingExpression(node) {throw new Error("Method 'visitParsingExpression' must be implemented.");}
	visitGroup(node) {throw new Error("Method 'visitGroup' must be implemented.");}
	visitString(node) {throw new Error("Method 'visitString' must be implemented.");}
	visitRange(node) {throw new Error("Method 'visitRange' must be implemented.");}
	visitInputRange(node) {throw new Error("Method 'visitInputRange' must be implemented.");}
	visitIdentifier(node) {throw new Error("Method 'visitIdentifier' must be implemented.");}
	visitNumber(node) {throw new Error("Method 'visitNumber' must be implemented.");}
} 
 export default Visitor;