import React from 'react';
import {Sentry} from 'react-native-sentry'

export default class ErrorBoundary extends React.Component {
  componentDidCatch (error, errorInfo) {
    Sentry.captureException(error, {
      extra: errorInfo
    });
  }

  render () {
    const { children } = this.props;
    return children;
  }
}