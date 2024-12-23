import Visitor from '../visitor/Visitor.js';
import  {Range}  from '../visitor/CST.js';
import  {generateCaracteres}  from './utils.js';

export default class Tokenizer extends Visitor {

    visitProductions(node){
        return node.expr.accept(this)
    }

    visitOptions(node){
        return node.exprs.map((node) => node.accept(this)).join('\n');
    }

    visitUnion(node){
        return node.exprs.map((node) => node.accept(this)).join('\n');
    }

    visitExpression(node){
        return node.expr.accept(this)
    }

    visitString(node) {
        const n = {
            val: node.val.toLowerCase(),  
            offset: node.val.substring(1, node.val.length-1).length - 1,
            length: node.val.substring(1, node.val.length-1).length,
            isSensitive: node.caseSensitive,
            qty: node.qty
        }  

        let template = ``
        
        if(n.isSensitive){
            template += `
            if ( ${n.val} ==  to_lower(input(cursor:cursor + ${n.offset}))) then
            `;  
        }else{
            template += `
            if ( ${n.val} == input(cursor:cursor + ${n.offset}) ) then
            `;  
        }
        
        template += 
        `
        allocate( character(len=${n.length}) :: lexeme)
                lexeme = input(cursor:cursor + ${n.offset})
                cursor = cursor + ${n.length}
                return
            end if
        `
        return template
    }

    visitRange(node) {
        const n = { val: node.characters, qty: node.qty };
        console.log(node, n)
        let template = ``;
        let copy = n.val;
        const regex = /([^\s])-([^\s])/gm;
        const found = copy.match(regex);

        if (found?.length > 0) {
            found.forEach(element => {
                template += `
                    if(iachar(input(cursor:cursor)) >= iachar('${element[0]}') .and. iachar(input(cursor:cursor)) <= iachar('${element[2]}')) then
                        allocate(character(len=1) :: lexeme)
                        lexeme = input(cursor:cursor)
                        cursor = cursor + 1
                        return
                    end if
                `;
            });
        }

        copy = [... new Set(copy.replace(regex, ''))].map(char => `'${char}'`);

        if (copy.length > 0) {
            template += `
                if(findloc([${copy.join(', ')}], input(cursor:cursor), 1) > 0) then
                    allocate(character(len=1) :: lexeme)
                    lexeme = input(cursor:cursor)
                    cursor = cursor + 1
                    return
                end if
            `;
        }
    
        return template;
    }

    visitIdentifier(node) {
        return '';
    }

    visitAny(node){
        return
    }
}
