import { Productions } from '../visitor/CST.js';
import { Or, Concat, Hoja, ZeroOrMore, OneOrMore } from './SyntaxTree.js';
import SyntaxTreeVisitor from './SyntaxTreeVisitor.js';

/**
 *
 * @param {Productions[]} CST
 */
export default function generateSyntaxTree(CST) {

    let followPosTable = [];
    let leafValue = [];
    
    let transitionTable = [];

    let nodeCounter = 0
    console.log(CST)
    const visitor = new SyntaxTreeVisitor(CST);
    const syntaxTree = [CST[0]].map((subTree) => subTree.accept(visitor)).reduce(
        (tree, subTree) => new Or(tree, subTree)
    );

    function visitCounter(node){
        if(node instanceof Hoja){
            nodeCounter++;
            leafValue.push(node.val)
            let body = {
                leaf: nodeCounter,
                symb: node.val,
                fp: [],
                isCase: node.isCase,
                type: node.type,
                assertion: node.assertion
            }
            followPosTable.push(body)
        }
    }

    function visitFollow(node){
        if(node instanceof OneOrMore || node instanceof ZeroOrMore){
            node.c1.lastPos.forEach((lpos)=>{
                let item = followPosTable.find((item)=> item.leaf === lpos)
                node.c1.firstPos.forEach((fpos)=>{
                    item.fp.push(fpos)
                })
            })
        }

        if(node instanceof Concat){
            node.c1.lastPos.forEach((lpos)=>{
                let item = followPosTable.find((item)=> item.leaf === lpos)
                node.c2.firstPos.forEach((fpos)=>{
                    item.fp.push(fpos)
                })
            })
        }
    }
    
    
    function postOrderTraversal(node, visit) {
        if (!node) return;
        postOrderTraversal(node.c1, visit);
        postOrderTraversal(node.c2, visit);
        visit(node);
    }
    
    postOrderTraversal(syntaxTree, visitCounter);

    const finalTree = new Concat(syntaxTree, new Hoja('#', ++nodeCounter));
    postOrderTraversal(finalTree, visitFollow);

    console.log(followPosTable)
    
    function combineFpForConsecutiveSymbs(array) {
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i].symb === array[i + 1].symb) {
                array[i].fp = Array.from(new Set([...array[i].fp, ...array[i + 1].fp]));
                array[i + 1].fp = array[i].fp;
            }
        }
        return array;
    }
    
    const combined = combineFpForConsecutiveSymbs(followPosTable);


    transitionTable.push({
        state: 0,
        leafNumbers: finalTree.firstPos,
        symbs: 
            combined.filter((item,index,self)=>
                self.findIndex(obj => obj.symb === item.symb) === index).map(item => ({
                    symb: item.symb.toString(),
                    transition: "",
                    isCase: item.isCase,
                    type: item.type,
                    assertion: item.assertion
                }))
        
    })

    console.log("Combined =====>", followPosTable)
    console.log("Transition Table 1 =====>", transitionTable)


    function arraysEqual(a, b) {
        return a.length === b.length && a.every((val) => b.includes(val));
    }
    
    for (let i = 0; i < transitionTable.length; i++) {
        transitionTable[i]["leafNumbers"].forEach((idFP, indexFP) => {
            let followPos = combined.find((item) => item.leaf === idFP);
            if (followPos) {
                if (followPos.fp.length > 0) {
                    let idxExist = transitionTable.findIndex((item) => arraysEqual(item.leafNumbers, followPos.fp));
                    if (idxExist === -1) {
                        transitionTable.push({
                            state: transitionTable.length,
                            leafNumbers: followPos.fp,
                            symbs: combined
                                .filter(
                                    (item, index, self) =>
                                        self.findIndex((obj) => obj.symb.toString() === item.symb.toString()) === index
                                )
                                .map((item) => ({
                                    symb: item.symb.toString(),
                                    transition: "",
                                    isCase: item.isCase,
                                    type: item.type,
                                    assertion: item.assertion
                                })),
                        });
                    }
                    let symb = transitionTable[i].symbs.find((item) => item.symb == followPos.symb.toString());
                    let idx = transitionTable.findIndex((item) => arraysEqual(item.leafNumbers, followPos.fp));
                    if (symb) symb.transition = idx.toString();
                }
            }
        });
    }

    console.log("Transition Table 2 =====>", transitionTable)
    
    let codeFortran = `
        module parser
            implicit none
            integer :: current_state = 0
            integer :: next_state = 0
            save current_state
            save next_state

            contains
                function nextSym(input, cursor) result(lexeme)
                    character(len=*), intent(in) :: input
                    integer, intent(inout) :: cursor
                    character(len=:), allocatable :: lexeme
                    integer :: len_temp
                    character(len=1000) :: temp_lexeme

                    temp_lexeme = ""
                    len_temp = 0

                    if(cursor > len(input)) then
                        allocate( character(len=3) :: lexeme )
                        lexeme = "EOF"
                        return
                    end if

                    do while(cursor <= len(input))
    `;

    transitionTable?.forEach((transition) => {
        const flag = transition.symbs.some(current => current.transition.length > 0);
        if (flag) {
            codeFortran += `if (current_state == ${transition.state}) then\n`;
            transition.symbs.forEach((symb) => {
                if (transition.state === 0 && symb.transition.length > 0) codeFortran += `current_state = ${symb.transition}`;
                if (symb.type === 'string' && symb.transition.length > 0)  {
                    codeFortran += fortranString(symb.symb, symb.transition, symb.isCase);
                } else if (symb.type === 'range' && symb.transition.length > 0 && (symb.symb != "." && symb.assertion != "!")) {
                    codeFortran += fortranRange(symb.symb, symb.transition, symb.isCase);
                }
            });
            codeFortran += `end if\n`;
        }
    });

    codeFortran += `
                end do
                if(cursor > len(input))then
                    allocate(character(len=len_temp) :: lexeme)
                    lexeme = temp_lexeme(:len_temp)
                    return 
                end if
            end function nextSym
        end module parser
    `;

    console.log(codeFortran);

    function fortranString(text, state, isCase) {
        let value = text.toLowerCase();
        let offset = text.substring(1, text.length - 1).length - 1;
        let len = text.substring(1, text.length - 1).length;
        let template = ``;

        if (isCase) {
            template += `if (${value} == to_lower(input(cursor:cursor + ${offset}))) then`;
        } else {
            template += `if (${value} == input(cursor:cursor + ${offset})) then`;
        }

        template += `
                next_state = ${state}
                if (current_state /= next_state) then
                    allocate(character(len=len_temp) :: lexeme)
                    lexeme = temp_lexeme(:len_temp)
                    return
                else
                    len_temp = len_temp + ${len}
                    temp_lexeme(len_temp:len_temp) = input(cursor:cursor+${offset})
                    cursor = cursor + ${len}
                    cycle
                end if
            end if
        `;
        
        return template;
    }

    function fortranRange(text, state, isSensitive) {
        let template = ``;
        let copy = text;
        const rangeRegex = /([^\s])-([^\s])/gm
        const rangesFound = copy.match(rangeRegex);

        if (rangesFound?.length > 0) {
            rangesFound.forEach(range => {
                template += `
                    if(iachar(input(cursor:cursor)) >= iachar('${range[0]}') .and. iachar(input(cursor:cursor)) <= iachar('${range[2]}')) then
                        next_state = ${state}
                        if (current_state /= next_state) then
                            allocate(character(len=len_temp) :: lexeme)
                            lexeme = temp_lexeme(:len_temp)
                            return
                        else
                            len_temp = len_temp + 1
                            temp_lexeme(len_temp:len_temp) = input(cursor:cursor)
                            cursor = cursor + 1
                            cycle
                        end if
                    end if
                `;
            });
            copy = copy.replace(rangeRegex, '');
        }

        const escapeToAscii = (match) => {
            const escapeMap = {
                ' ': 'char(32)',
                '\\n': 'char(10)',
                '\\r': 'char(13)',
                '\\t': 'char(9)',
                '\\b': 'char(8)',
                '\\f': 'char(12)',
                '\\v': 'char(11)',
                "\\'": 'char(39)',
                '\\"': 'char(34)',
                '\\\\': 'char(92)'
            };
            return escapeMap[match] || match;
        };

        let spaces = [];
        copy = copy.replace(/ |\\n|\\r|\\t|\\b|\\f|\\v|\\'|\\"|\\\\/gm, (match) => {
            const ascii = escapeToAscii(match);
            if (ascii !== match) {
                spaces.push(ascii);
                return '';
            } 
            return match;
        });

        spaces = [...new Set(spaces)];
        copy = [...new Set(copy)];

        const asciiChars = copy.map((char) => `char(${char.charCodeAt(0)})`);

        if (spaces.length > 0 || asciiChars.length > 0) {
            const temporal = [...spaces, ...asciiChars].join(', ');
            template += `
                if(findloc([${temporal}], input(cursor:cursor), 1) > 0) then
                    next_state = ${state}
                    if (current_state /= next_state) then
                        allocate(character(len=len_temp) :: lexeme)
                        lexeme = temp_lexeme(:len_temp)
                        return
                    else
                        len_temp = len_temp + 1
                        temp_lexeme(len_temp:len_temp) = input(cursor:cursor)
                        cursor = cursor + 1
                        cycle
                    end if
                end if 
            `;
        }
    
        return template;
    }

    return finalTree
}

