import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';


class ClientRoot extends React.Component {
  componentDidMount() {
    // Remove server-rendered styles
    const jssStyles = document.getElementById('jss-server-side');
    if(jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  }
}


export default ClientRoot;
