const nodes = {
    Productions: ['id', 'expr', 'alias'],
    Options: ['exprs'],
    Union: ['exprs'],
    Expression: ['expr', 'label', 'qty', 'assertion'],
    String: ['val', 'isCase'],
    Class: ['chars', 'isCase'],
    Range: ['characters', 'isCase'],
    Identifier: ['id'],
    Any: ['val'],
};

export default nodes;
