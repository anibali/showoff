import React from 'react';
import DocumentTitle from 'react-document-title';

const App = (props) => (
  <DocumentTitle title="Showoff">
    <div className="fill-space">
      {props.children}
    </div>
  </DocumentTitle>
);

export default App;
