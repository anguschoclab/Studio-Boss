const React = require('react');
const ReactDOMServer = require('react-dom/server');

const content = "body { color: red; } </style><script>alert(1)</script>";

const el1 = React.createElement('style', { dangerouslySetInnerHTML: { __html: content } });
console.log("dangerouslySetInnerHTML:");
console.log(ReactDOMServer.renderToString(el1));

const el2 = React.createElement('style', null, content);
console.log("Children:");
console.log(ReactDOMServer.renderToString(el2));
