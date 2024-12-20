import  Visitor  from './Visitor.js';

class Tokenizer extends Visitor {
    
    generateTokenizer(grammar){
        console.log('generateTokenizer function')
        let template = `
module tokenizer
    implicit none

    contains

    function to_lower(strIn) result(strOut)
        character(len=*), intent(in) :: strIn
        character(len=len(strIn)) :: strOut
        integer :: i, j

        do i = 1, len(strIn)
            j = iachar(strIn(i:i))
            if(j >= iachar("A") .and. j <= iachar("Z")) then
                strOut(i:i) = achar(iachar(strIn(i:i)) + 32)
            else
                strOut(i:i) = strIn(i:i)
            end if
        end do
    end function to_lower

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
            val: node.value.toLowerCase(),  
            offset: node.value.substring(1, node.value.length-1).length - 1,
            length: node.value.substring(1, node.value.length-1).length,
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
}

export default Tokenizer;