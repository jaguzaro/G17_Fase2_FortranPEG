const nodes = {
    Productions: ['id', 'expr', 'alias'],
    Options: ['exprs'],
    Union: ['exprs'],
    Expression: ['expr', 'label', 'qty'],
    String: ['val', 'isCase'],
    Range: ['characters', 'isCase'],
};

export default nodes;
