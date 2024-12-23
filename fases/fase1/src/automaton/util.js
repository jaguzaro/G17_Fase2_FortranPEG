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
                type: node.type
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
                    type: item.type
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
                                    type: item.type
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
    
    let codeFortran = ``;

    transitionTable?.forEach((transition) => {
        const flag = transition.symbs.some(current => current.transition.length > 0);
        if (flag) {
            codeFortran += `if (state == ${transition.state}) then`;
            transition.symbs.forEach((symb) => {
                if (symb.type === 'string' && symb.transition.length > 0) {
                    codeFortran += fortranString(symb.symb, symb.transition, symb.isCase);
                } else if (symb.type === 'range' && symb.transition.length > 0 && (symb.symb != "." && symb.assertion != "!")) {
                    codeFortran += fortranRange(symb.symb, symb.transition, symb.isCase);
                }
            });
            codeFortran += `end if`;
        }
    });

    console.log(codeFortran);

    function fortranString(text, state, isSensitive) {
        let value = text.toLowerCase();
        let offset = text.substring(1, text.length - 1).length - 1;
        let len = text.substring(1, text.length - 1).length;
        let template = ``;

        if (isSensitive) {
            template += `if (${value} == to_lower(input(cursor:cursor + ${offset}))) then`;
        } else {
            template += `if (${value} == input(cursor:cursor + ${offset})) then`;
        }

        template += `
                allocate(character(len=${len}) :: lexeme)
                lexeme = input(cursor:cursor + ${offset})
                cursor = cursor + ${len}
                state = ${state}
                return
            end if
        `;
        
        return template;
    }

    function fortranRange(text, state, isCase) {
        let template = ``;
        let copy = text;
        const rangeRegex = /([^\s])-([^\s])/gm
        const rangesFound = copy.match(rangeRegex);

        if (rangesFound?.length > 0) {
            rangesFound.forEach(range => {
                if (isCase) {
                    template += `if(iachar(to_lower(input(cursor:cursor))) >= iachar('${range[0].toLowerCase()}') .and. &
                    iachar(to_lower(input(cursor:cursor))) <= iachar('${range[2].toLowerCase()}')) then`;
                } else {
                    template += `if(iachar(input(cursor:cursor)) >= iachar('${range[0]}') .and. &
                                 iachar(input(cursor:cursor)) <= iachar('${range[2]}')) then`;
                }

                template += `
                        allocate(character(len=1) :: lexeme)
                        lexeme = input(cursor:cursor)
                        cursor = cursor + 1
                        state = ${state}
                        return
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

        const asciiChars = copy.map((char) => {
            if (isCase) {   
                return `char(${char.toLowerCase().charCodeAt(0)})`
            } else {
                return `char(${char.charCodeAt(0)})`
            }
        });

        if (spaces.length > 0 || asciiChars.length > 0) {
            const temporal = [...spaces, ...asciiChars].join(', ');
            template += `
                if(findloc([${temporal}], ${(isCase) ? 'to_lower(input(cursor:cursor))' : 'input(cursor:cursor)'}, 1) > 0) then
                    allocate(character(len=1) :: lexeme)
                    lexeme = input(cursor:cursor)
                    cursor = cursor + 1
                    state = ${state}
                    return
                end if 
            `;
        }
    
        return template;
    }

    return finalTree
}

