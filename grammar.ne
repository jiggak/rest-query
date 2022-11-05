#@builtin "whitespace.ne"

statement -> from {% id %}
   | select __ from {% d => ({...d[0], ...d[2]}) %}

from -> "from" __ name {% d => ({from: d[2]}) %}

select -> "select" __ nameList {% d => ({select: d[2]}) %}

name -> _name {% d => ({name: d[0]}) %}
_name -> [a-zA-Z_] {% id %}
   | _name [\w_.] {% d => d[0] + d[1] %}

nameList -> name {% d => ({names: [d[0].name]}) %}
   | nameList _ "," _ name {% d => ({names: d[0].names.concat([d[4].name])}) %}

# Whitespace
_ -> null | _ [\s] {% () => {} %}                   # optional
__ -> [\s] {% () => {} %} | __ [\s] {% () => {} %}  # required
