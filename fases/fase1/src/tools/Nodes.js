const nodes = {
    Productions: ['id', 'expr', 'alias'],
    Options: ['exprs'],
    Union: ['exprs'],
    Expression: ['expr', 'label', 'qty'],
    String: ['val', 'isCase'],
    Class: ['chars', 'isCase'],
    Range: ['characters', 'isCase'],
    Identifier: ['id'],
};

export default nodes;
