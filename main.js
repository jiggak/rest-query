const { execQuery } = require('.');

execQuery(
   `select data.breed, data.origin, data.coat, data.pattern
   from breeds
   where limit = 20 and page = 2`,
   { breeds: 'https://catfact.ninja/breeds' }
).then(data => console.table(data));
