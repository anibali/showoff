const React = require('react');
const DocumentTitle = require('react-document-title');

const App = (props) => (
  <DocumentTitle title="Showoff">
    <div className="fill-space">
      {props.children}
    </div>
  </DocumentTitle>
);

module.exports = App;
