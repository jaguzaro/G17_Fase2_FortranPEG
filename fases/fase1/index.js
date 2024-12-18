import * as monaco from "https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/+esm";
import { parse } from "./parser/peg-parser.js";
import { ErrorReglas } from "./parser/error.js";
import Tokenizer from "./src/Tokenizer.js"

export let ids = [];
export let usos = [];
export let errores = [];

const editor = monaco.editor.create(document.getElementById("editor"), {
    value: "",
    language: "java",
    theme: "tema",
    automaticLayout: true,
});

const salida = monaco.editor.create(document.getElementById("salida"), {
    value: "",
    language: "java",
    readOnly: true,
    automaticLayout: true,
});

let decorations = [];

const analizar = () => {
    const entrada = editor.getValue();
    const tokenizer = new Tokenizer();
    ids.length = 0;
    usos.length = 0;
    errores.length = 0;
    try {
        const cst = parse(entrada);
        tokenizer.generateTokenizer(cst)
        if (errores.length > 0) {
            salida.setValue(`Error: ${errores[0].message}`);
            return;
        } else {
            salida.setValue("Análisis Exitoso");
        }

        decorations = editor.deltaDecorations(decorations, []);
    } catch (e) {
        if (e.location === undefined) {
            salida.setValue(`Error: ${e.message}`);
        } else {
            salida.setValue(
                `Error: ${e.message}\nEn línea ${e.location.start.line} columna ${e.location.start.column}`
            );

            decorations = editor.deltaDecorations(decorations, [
                {
                    range: new monaco.Range(
                        e.location.start.line,
                        e.location.start.column,
                        e.location.start.line,
                        e.location.start.column + 1
                    ),
                    options: {
                        inlineClassName: "errorHighlight",
                    },
                },
                {
                    range: new monaco.Range(
                        e.location.start.line,
                        e.location.start.column,
                        e.location.start.line,
                        e.location.start.column
                    ),
                    options: {
                        glyphMarginClassName: "warningGlyph",
                    },
                },
            ]);
        }
    }
};

editor.onDidChangeModelContent(() => {
    analizar();
});

const style = document.createElement("style");
style.innerHTML = `
    .errorHighlight {
        color: red !important;
        font-weight: bold;
    }
    .warningGlyph {
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="orange" d="M8 1l7 14H1L8 1z"/></svg>') no-repeat center center;
        background-size: contain;
    }
`;
document.head.appendChild(style);
