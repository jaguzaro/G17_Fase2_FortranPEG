
import Node from './Node.js';

export class Productions extends Node {
    constructor(id, expr, alias) {
        super();
        this.id = id;
		this.expr = expr;
		this.alias = alias;
    }

    accept(visitor) {
        return visitor.visitProductions(this);
    }
}
    
export class Options extends Node {
    constructor(exprs) {
        super();
        this.exprs = exprs;
    }

    accept(visitor) {
        return visitor.visitOptions(this);
    }
}
    
export class Union extends Node {
    constructor(exprs) {
        super();
        this.exprs = exprs;
    }

    accept(visitor) {
        return visitor.visitUnion(this);
    }
}
    
export class Expression extends Node {
    constructor(expr, label, qty, assertion) {
        super();
        this.expr = expr;
		this.label = label;
		this.qty = qty;
		this.assertion = assertion;
    }

    accept(visitor) {
        return visitor.visitExpression(this);
    }
}
    
export class String extends Node {
    constructor(val, isCase) {
        super();
        this.val = val;
		this.isCase = isCase;
    }

    accept(visitor) {
        return visitor.visitString(this);
    }
}
    
export class Class extends Node {
    constructor(chars, isCase) {
        super();
        this.chars = chars;
		this.isCase = isCase;
    }

    accept(visitor) {
        return visitor.visitClass(this);
    }
}
    
export class Range extends Node {
    constructor(characters, isCase) {
        super();
        this.characters = characters;
		this.isCase = isCase;
    }

    accept(visitor) {
        return visitor.visitRange(this);
    }
}
    
export class Identifier extends Node {
    constructor(id) {
        super();
        this.id = id;
    }

    accept(visitor) {
        return visitor.visitIdentifier(this);
    }
}
    
export class Any extends Node {
    constructor(val) {
        super();
        this.val = val;
        this.assertion = null
    }

    accept(visitor) {
        return visitor.visitAny(this);
    }
}
    