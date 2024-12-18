import Node from "../src/Nodes.js";
export class Rule extends Node{
    constructor(id, expression, alias) {
        super();
        this.id = id;
		this.expression = expression;
		this.alias = alias;
    }

    accept(visitor){
        return visitor.visitRule(this);
    }
}


export class Choice extends Node{
    constructor(expressions) {
        this.expressions = expressions;
    }

    accept(visitor){
        return visitor.visitChoice(this);
    }
}


export class Concatenation extends Node{
    constructor(expressions) {
        this.expressions = expressions;
    }

    accept(visitor){
        return visitor.visitConcatenation(this);
    }
}


export class Pluck extends Node{
    constructor(expression, pluck) {
        this.expression = expression;
		this.pluck = pluck;
    }

    accept(visitor){
        return visitor.visitPluck(this);
    }
}


export class Label extends Node{
    constructor(expression, identifier) {
        this.expression = expression;
		this.identifier = identifier;
    }

    accept(visitor){
        return visitor.visitLabel(this);
    }
}


export class Expression extends Node{
    constructor(expression, quantifier, text) {
        this.expression = expression;
		this.quantifier = quantifier;
		this.text = text;
    }

    accept(visitor){
        return visitor.visitExpression(this);
    }
}


export class Quantifier extends Node{
    constructor(value) {
        this.value = value;
    }

    accept(visitor){
        return visitor.visitQuantifier(this);
    }
}


export class ParsingExpression extends Node{
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor){
        return visitor.visitParsingExpression(this);
    }
}


export class Group extends Node{
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor){
        return visitor.visitGroup(this);
    }
}


export class String extends Node{
    constructor(value, caseSensitive) {
        super();
        this.value = value;
		this.caseSensitive = caseSensitive;
    }

    accept(visitor){
        return visitor.visitString(this);
    }
}


export class Range extends Node{
    constructor(characters) {
        this.characters = characters;
    }

    accept(visitor){
        return visitor.visitRange(this);
    }
}


export class InputRange extends Node{
    constructor(value) {
        this.value = value;
    }

    accept(visitor){
        return visitor.visitInputRange(this);
    }
}


export class Identifier extends Node{
    constructor(value) {
        this.value = value;
    }

    accept(visitor){
        return visitor.visitIdentifier(this);
    }
}


export class Number extends Node{
    constructor(value) {
        this.value = value;
    }

    accept(visitor){
        return visitor.visitNumber(this);
    }
}

