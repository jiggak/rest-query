const { execQuery } = require('.');

execQuery(
   `select data.breed, data.origin, data.coat, data.pattern
   from https://catfact.ninja/breeds
   where limit = 20 and page = 2`
).then(data => console.table(data));
