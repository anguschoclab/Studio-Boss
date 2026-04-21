const React = require('react');
const ReactDOMServer = require('react-dom/server');

const element = React.createElement('style', null, `</style><script>alert(1)</script>`);
console.log(ReactDOMServer.renderToString(element));
