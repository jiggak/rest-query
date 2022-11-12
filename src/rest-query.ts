import _ from 'underscore';
import { Parser, Grammar } from 'nearley';
import grammar from './grammar';

interface WhereExpr {
   name:string,
   value:number|string
}

interface Select {
   names:string[]
}

interface SelectAll {
   all:boolean,
   name?:string
}

interface Query {
   select?:Select|SelectAll,
   from:string,
   where?:WhereExpr[]
}

function select(data:any, spec:Select|SelectAll):any {
   if ("all" in spec) {
      if (spec.name) {
         return data[spec.name];
      }

      return data;
   }

   let output = [];

   const fields = _.groupBy(spec.names, f => f.split('.')[0]);

   if (_.isArray(data)) {
      for (const row of data) {
         let outputRow:any = {};
         for (const f in fields) {
            outputRow[f] = row[f];
         }
         output.push(outputRow);
      }
   } else {
      for (const f in fields) {
         if (_.isArray(data[f])) {
            return select(data[f], {names: _.map(fields[f], x => x.replace(f + '.', ''))});
         }
      }
   }

   return output;
}

function output(query:Query, data:any):any {
   if (query.select) {
      data = select(data, query.select);
   }

   return data;
}

function urlQuery(where:WhereExpr[]) {
   return where.map(c => `${encodeURIComponent(c.name)}=${encodeURIComponent(c.value)}`)
      .join('&');
}

export function execQuery(sql:string):Promise<any> {
   const parser = new Parser(Grammar.fromCompiled(grammar));

   parser.feed(sql);
   const query = parser.results[0] as Query;

   if (query.from) {
      let url = query.from;

      if (query.where) {
         url = `${url}?${urlQuery(query.where)}`;
      }

      return fetch(url)
         .then(response => response.json())
         .then(data => output(query, data));
   } else {
      return Promise.reject('not implemented');
   }
}