import * as React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './pages/app';
import Container from './pages/_container';

export function getRoutes() {
  return (
    <Route path='/' component={Container}>
      <IndexRoute component={App} />
    </Route>
  );
}
