import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';

//import * as ReactDOMClient from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { client } from './app/apollo';

import App from './app/modules/';

import './less/index.less';

//console.log('path=%s', process.env.ASSET_PATH);
const base_path = process.env.ASSET_PATH ? process.env.ASSET_PATH : '/';

const container = document.getElementById('app');
//const root = ReactDOMClient.createRoot(container);

ReactDOM.render(
  <Router basename={base_path}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Router>,
  container,
);
