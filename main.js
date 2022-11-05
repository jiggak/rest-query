const _ = require('underscore');
const {Parser, Grammar} = require('nearley');
const grammar = require('./grammar.js');

const parser = new Parser(Grammar.fromCompiled(grammar));

function select(data, fields) {
   let output = [];

   const groupedFields = _.groupBy(fields, f => f.split('.')[0]);

   if (_.isArray(data)) {
      for (const row of data) {
         let outputRow = {};
         for (const f in groupedFields) {
            outputRow[f] = row[f];
         }
         output.push(outputRow);
      }
   } else {
      for (const f in groupedFields) {
         if (_.isArray(data[f])) {
            return select(data[f], _.map(groupedFields[f], x => x.replace(f + '.', '')));
         }
      }
   }

   return output;
}

function output(query, data) {
   if (query.select) {
      data = select(data, query.select.names);
   }

   console.table(data);
}

function exec(sql, params) {
   parser.feed(sql);
   const query = parser.results[0];

   if (query.from) {
      fetch(params[query.from.name])
         .then(response => response.json())
         .then(data => output(query, data));
   }
}

exec(
   'select data.breed, data.coat, data.pattern from breeds',
   {breeds: 'https://catfact.ninja/breeds'}
);

//select(null, ['data.breed', 'data.country']);