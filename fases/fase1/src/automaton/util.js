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

    return finalTree
}

