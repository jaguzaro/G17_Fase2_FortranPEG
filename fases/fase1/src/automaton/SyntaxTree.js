class Node {
    constructor() {
        this._anulable = null;
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {}

    /**
     * @returns {number[]}
     */
    ultimaPos() {}

    /**
     * @returns {boolean}
     */
    anulable() {
        return this._anulable
    }
}

export class Hoja extends Node {
    /** @type {number} */
    pos;
    /** @type {string} */
    val;
    /** @type {string} */
    type;

    /**
     *
     * @param {string} val
     */
    constructor(val, pos, type, isCase, assertion) {
        super();
        this.val = val;
        this._anulable = false;
        this.pos = pos;
        this.type = type;
        this.isCase = isCase;
        this.firstPos = this.primeraPos();
        this.lastPos = this.ultimaPos();
        this.assertion = assertion;
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {
        return [this.pos];
    }

    /**
     * @returns {number[]}
     */
    ultimaPos() {
        return [this.pos];
    }

    /**
     * @returns {boolean}
     */
    anulable() {
        return false;
    }
}

export class Concat extends Node {
    c1;
    c2;

    /**
     *
     * @param {Node} c1
     * @param {Node} c2
     */
    constructor(c1, c2) {
        super();
        this.c1 = c1;
        this.c2 = c2;
        this._anulable = this.anulable();
        this.firstPos = this.primeraPos();
        this.lastPos = this.ultimaPos();
        this.followPos = this.siguientePos();
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {
        return this.c1.anulable()
            ? [...this.c1.primeraPos(), ...this.c2.primeraPos()]
            : this.c1.primeraPos();
    }

    /**
     * @returns {number[]}
     */
    ultimaPos() {
        return this.c2.anulable()
            ? [...this.c1.ultimaPos(), ...this.c2.ultimaPos()]
            : this.c2.ultimaPos();
    }

    siguientePos(){
        return {
            leaf: this.c1.ultimaPos(),
            follow: this.c2.primeraPos()
        }
    }

    /**
     * @returns {boolean}
     */
    anulable() {
        return this.c1.anulable() && this.c2.anulable();
    }
}

export class Or extends Node {
    c1;
    c2;

    /**
     *
     * @param {Node} c1
     * @param {Node} c2
     */
    constructor(c1, c2) {
        super();
        this.c1 = c1;
        this.c2 = c2;
        this._anulable = this.anulable
        this.firstPos = this.primeraPos();
        this.lastPos = this.ultimaPos();
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {
        return [...this.c1.primeraPos(), ...this.c2.primeraPos()];
    }

    /**
     * @returns {number[]}
     */
    ultimaPos() {
        return [...this.c1.ultimaPos(), ...this.c2.ultimaPos()];
    }

    /**
     * @returns {boolean}
     */
    anulable() {
        return this.c1.anulable() || this.c2.anulable();
    }
}

export class ZeroOrMore extends Node {
    c1;

    /**
     *
     * @param {Node} c1
     */
    constructor(c1) {
        super();
        this.c1 = c1;
        this._anulable = this.anulables();
        this.firstPos = this.primeraPos();
        this.lastPos = this.ultimaPos();
        this.followPos = this.siguientePos();
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {
        return this.c1.primeraPos();
    }

    /**
     * @returns {number[]}
     */
    ultimaPos() {
        return this.c1.ultimaPos();
    }

    siguientePos(){
        return {
            leaf: this.c1.ultimaPos(),
            follow: this.c1.primeraPos()
        }
    }

    /**
     * @returns {boolean}
     */
    anulables() {
        return true;
    }
}

export class OneOrMore extends Node {
    c1;

    /**
     *
     * @param {Node} c1
     */
    constructor(c1) {
        super()
        this.c1 = c1;
        this._anulable = this.anulable();
        this.firstPos = this.primeraPos();
        this.lastPos = this.ultimaPos();
        this.followPos = this.siguientePos();
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {
        return this.c1.primeraPos();
    }

    /**
     * @returns {number[]}
     */
    ultimaPos() {
        return this.c1.ultimaPos();
    }

    siguientePos(){
        return {
            leaf: this.c1.ultimaPos(),
            follow: this.c1.primeraPos()
        }
    }

    /**
     * @returns {boolean}
     */
    anulable() {
        return this.c1.anulable();
    }
}

export class Option extends Node {
    c1;

    /**
     *
     * @param {Node} c1
     */
    constructor(c1) {
        super()
        this.c1 = c1;
        this._anulable = this.anulable();
        this.firstPos = this.primeraPos();
        this.lastPos = this.ultimaPos();
    }

    /**
     * @returns {number[]}
     */
    primeraPos() {
        return this.c1.primeraPos();
    }

    /**
     * @returns {number[]}
     */
    ultimaPos() {
        return this.c1.ultimaPos();
    }

    /**
     * @returns {boolean}
     */
    anulable() {
        return true;
    }
}
