import { Any } from '../visitor/CST.js';
import Visitor from '../visitor/Visitor.js';
import * as Syntax from './SyntaxTree.js';

export default class SyntaxTreeVisitor extends Visitor {

    nodeCounter = 0;

    constructor(CST){
        super();
        this.CST = CST;
    }

    visitProductions(node) {
        return node.expr.accept(this);
    }
    visitOptions(node) {
        return node.exprs
            .map((expr) => expr.accept(this))
            .reduce((subTree, curr) => new Syntax.Or(subTree, curr));
    }
    visitUnion(node) {
        return node.exprs
            .map((expr) => expr.accept(this))
            .reduce((subTree, curr) => new Syntax.Concat(subTree, curr));
    }
    visitExpression(node) {
        switch (node.qty) {
            case '*':
                return new Syntax.ZeroOrMore(node.expr.accept(this));
            case '+':
                return new Syntax.OneOrMore(node.expr.accept(this));
            case '?':
                return new Syntax.Option(node.expr.accept(this));
            default:
                return node.expr.accept(this);
        }
    }
    visitString(node) {
        return new Syntax.Hoja(node.val, ++this.nodeCounter, "string", node.isCase);
    }
    visitClass(node) {
        return new Syntax.Hoja(node.chars.join(''), ++this.nodeCounter, "class", node.isCase);
    }
    visitRange(node) {
        return new Syntax.Hoja(node.characters, ++this.nodeCounter, "range", node.isCase);
    }
    visitIdentifier(node) {
        const subTree = this.CST.find((subTree) => subTree.id === node.id);
        console.log("==== SUBTREE =====",subTree)
        return subTree.expr.accept(this);
    }

    visitAny(node){
        console.log(node)
        return new Syntax.Hoja(node.val, ++this.nodeCounter, "range", false, node.assertion);
    }
}
