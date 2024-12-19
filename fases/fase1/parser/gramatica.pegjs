{{
    import { ids, usos} from '../index.js'
    import { ErrorReglas } from './error.js'
    import { errores } from '../index.js'
    import * as n from '../src/CST.js'
}}

gramatica 
    = _ val:producciones+ _ 
        {
            let duplicados = ids.filter((item, index) => ids.indexOf(item) !== index);
            if (duplicados.length > 0) {
                errores.push(new ErrorReglas("Regla duplicada: " + duplicados[0]));
            }
            let noEncontrados = usos.filter(item => !ids.includes(item));
            if (noEncontrados.length > 0) {
                errores.push(new ErrorReglas("Regla no encontrada: " + noEncontrados[0]));
            }
            console.log(val, 5)
            return val;
        }

producciones
    = _ id:identificador _ (literales)? _ "=" _ val:opciones (_";")? { ids.push(id); console.log(val, 4); return val }

opciones 
    = val:union (_ "/" _ union)* {return val}

union 
    = val:expresion (_ expresion !(_ literales? _ "=") )* {console.log(val, 3);return val}

expresion 
    = (etiqueta/varios)? _ val:expresiones _ ([?+*]/conteo)? {return val}

etiqueta 
    = ("@")? _ id:identificador _ ":" (varios)?

varios 
    = ("!"/"$"/"@"/"&")

expresiones 
    =  id:identificador { usos.push(id) }
    /  val:literales temp:"i"? { 
            console.log(val, 2); 
            return (temp === "i") ? new n.String(val, true) : new n.String(val, false)
        }
    /  "(" _ opciones _ ")"
    /  corchetes "i"?
    /  "."
    /  "!."

conteo
    = "|" _ (numero / id:identificador) _ "|"
    / "|" _ (numero / id:identificador)? _ ".." _ (numero / id2:identificador)? _ "|"
    / "|" _ (numero / id:identificador)? _ "," _ opciones _ "|"
    / "|" _ (numero / id:identificador)? _ ".." _ (numero / id2:identificador)? _ "," _ opciones _ "|"

corchetes
    = "[" contenido:(rango / contenido)+ "]" {
        return `Entrada válida: [${input}]`;
    }

rango
    = inicio:caracter "-" fin:caracter 
        {
            if (inicio.charCodeAt(0) > fin.charCodeAt(0)) {
                throw new Error(`Rango inválido: [${inicio}-${fin}]`);
            }
            return `${inicio}-${fin}`;
        }      

caracter
    = [a-zA-Z0-9_ ] { return text() }

contenido
    = (corchete / texto)+

corchete
    = "[" contenido "]"

texto
    = [^\[\]]+

literales 
    = '"' value:stringDobleComilla* '"' { console.log(text(), 1); return text() }
    / "'" value:stringSimpleComilla* "'" { return text() }

stringDobleComilla 
    = !('"' / "\\" / finLinea) .
    / "\\" escape
    / continuacionLinea

stringSimpleComilla 
    = !("'" / "\\" / finLinea) .
    / "\\" escape
    / continuacionLinea

continuacionLinea 
    = "\\" secuenciaFinLinea

finLinea 
    = [\n\r\u2028\u2029]

escape 
    = "'"
    / '"'
    / "\\"
    / "b"
    / "f"
    / "n"
    / "r"
    / "t"
    / "v"
    / "u"

secuenciaFinLinea
    = "\r\n" / "\n" / "\r" / "\u2028" / "\u2029"    

numero 
    = [0-9]+

identificador 
    = [_a-z]i[_a-z0-9]i* { return text() }


_ 
    = (Comentarios /[ \t\n\r])*


Comentarios 
    = "//" [^\n]* 
    / "/*" (!"*/" .)* "*/"
