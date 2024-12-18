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
        let template = `
        if ( 1 == input(cursor:cursor + 1) ) then
            allocate( character(len=1) :: lexeme)
            lexeme = input(cursor:cursor + 1)
            cursor = cursor + 1
            return
        end if
        `;

        return template
    }
}

export default Tokenizer;