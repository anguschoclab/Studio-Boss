const React = require('react');
const ReactDOMServer = require('react-dom/server');

const content = "body { color: red; } </style><script>alert(1)</script>".replace(/</g, "\\3C ");

const el = React.createElement('style', null, content);
console.log(ReactDOMServer.renderToString(el));
