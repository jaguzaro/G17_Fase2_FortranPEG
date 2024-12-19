import  Visitor  from './Visitor.js';

class Tokenizer extends Visitor {
    
    generateTokenizer(grammar){
        console.log('generateTokenizer function')
        let template = `
module tokenizer
    implicit none

    contains
    function nextSym(input, cursor) result(lexeme)
        character(len=*), intent(in) :: input
        integer, intent(inout) :: cursor
        character(len=:), allocatable :: lexeme`

        let body = grammar.map(rule => rule.accept(this));
        template += body;

        template += 
        `print *, "error lexico en col ", cursor, ', "'//input(cursor:cursor)//'"'
    end function nextSym
end module tokenizer`;

        console.log(template)
    }

    visitRule(node){
        return node.expression.accept(this)
    }

    visitString(node) {
        console.log();
        const n = {
            val: node.value,  
            offset: node.value.substring(1, node.value.length-1).length - 1,
            length: node.value.substring(1, node.value.length-1).length
        }   
        let template = `
        if ( ${n.val} == input(cursor:cursor + ${n.offset}) ) then
            allocate( character(len=${n.length}) :: lexeme)
            lexeme = input(cursor:cursor + ${n.offset})
            cursor = cursor + ${n.length}
            return
        end if
        `;  
        
        return template
    }
}

export default Tokenizer;