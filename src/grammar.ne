@preprocessor typescript

#@builtin "whitespace.ne"
@builtin "number.ne"
@builtin "string.ne"

statement -> from {% id %}
   | select __ from {% d => ({...d[0], ...d[2]}) %}

from -> "from" __ url {% d => ({from: d[2]}) %}
   | "from" __ url __ "where" __ expr (__ "and" __ expr):* {%
      function (d) {
         let where = [d[6]];
         if (d.length > 7) {
            where = where.concat(
               d[7].map((x:any) => x[3])
            );
         }

         return {
            from: d[2],
            where: where
         };
      }
   %}

expr -> name _ "=" _ value {% d => ({name: d[0].name, value: d[4]}) %}

value -> int {% id %}
   | dqstring {% id %}
   | "true" {% d => true %}
   | "false" {% d => false %}
   | "null" {% d => null %}

select -> "select" __ nameList {% d => ({select: d[2]}) %}
   | "select" __ "*" {% d => ({select: {all: true}}) %}
   | "select" __ name ".*" {% d => ({select: {all:true, ...d[2]}}) %}

name -> _name {% d => ({name: d[0]}) %}
_name -> [a-zA-Z_] {% id %}
   | _name [\w_.] {% d => d[0] + d[1] %}

nameList -> name {% d => ({names: [d[0].name]}) %}
   | nameList _ "," _ name {% d => ({names: d[0].names.concat([d[4].name])}) %}

_proto -> "http" | "https"
url -> _proto "://" .:+ {% d => d[0] + d[1] + d[2].join('') %}

# Whitespace
_ -> null | _ [\s] {% () => {} %}                   # optional
__ -> [\s] {% () => {} %} | __ [\s] {% () => {} %}  # required
