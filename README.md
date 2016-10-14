# broccoli-cldr-data

Broccoli plugin for writing results of formatjs-extract-cldr-data to a broccoli node

```js
var extract = require('broccoli-cldr-data');

extract(inputNode, {
  locales: ['fr-ca', 'en-ca'], /* defaults to all locales */
  moduleType: 'commonjs', /* options: commonjs, es6 */
  pluralRules: true, /* defaults to true */
  relativeFields: false /* defaults to true */
});
```

```js
// en.js
module.exports = [
{"locale":"en-CA","parentLocale":"en-001"},
{"locale":"en-001","parentLocale":"en"},
{"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}}];
```

```js
// fr.js
module.exports = [
{"locale":"fr-CA","parentLocale":"fr"},
{"locale":"fr","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return n>=0&&n<2?"one":"other"}}
];
```
