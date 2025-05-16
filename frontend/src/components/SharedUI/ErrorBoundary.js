// components/SharedUI/ErrorBoundary.js
import React, { Component } from 'react';
import styled from 'styled-components';
import theme from '../../config/theme';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  margin: ${theme.spacing.lg};
  background: ${theme.colors.bgDeep};
  border: 1px solid ${theme.colors.accentTertiary};
  border-radius: ${theme.borderRadius.lg};
  color: white;
  text-align: center;
  box-shadow: ${theme.shadows.md};
`;

const ErrorTitle = styled.h2`
  font-family: ${theme.fonts.display};
  color: ${theme.colors.accentTertiary};
  margin-bottom: ${theme.spacing.md};
`;

const ErrorMessage = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const RetryButton = styled.button`
  background: ${theme.gradients.button};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-family: ${theme.fonts.display};
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.animation.fast} ${theme.animation.easing.default};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

/**
 * Error Boundary component for catching and displaying JavaScript errors
 * Can be placed around any component tree to catch errors within it
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture error details for display and reporting
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Log error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Implement error reporting to a service if needed
    if (this.props.onError) {
      this.props.onError({
        error,
        errorInfo,
        componentStack: errorInfo ? errorInfo.componentStack : '',
        errorCount: this.state.errorCount + 1,
        componentName: this.props.componentName || 'Unknown'
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ error, errorInfo, onRetry: this.handleRetry }) 
          : fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {error && error.message ? error.message : 'An unexpected error occurred'}
          </ErrorMessage>
          {this.props.showStack && errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginBottom: '20px' }}>
              <summary>Error Details</summary>
              {error && error.toString()}
              <br />
              {errorInfo.componentStack}
            </details>
          )}
          <RetryButton onClick={this.handleRetry}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return children;
  }
}

export default ErrorBoundary;