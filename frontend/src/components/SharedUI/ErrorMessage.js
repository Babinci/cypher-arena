// components/SharedUI/ErrorMessage.js
import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../../config/theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin: ${props => props.margin || '10px 0'};
  background: ${props => {
    switch (props.severity) {
      case 'critical':
        return 'rgba(220, 53, 69, 0.9)';
      case 'warning':
        return 'rgba(255, 193, 7, 0.9)';
      case 'info':
        return 'rgba(13, 110, 253, 0.9)';
      default:
        return 'rgba(220, 53, 69, 0.9)';
    }
  }};
  color: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  animation: ${props => props.isClosing ? fadeOut : fadeIn} 0.3s ease-in-out;
  max-width: ${props => props.maxWidth || '100%'};
  position: ${props => props.position === 'fixed' ? 'fixed' : 'relative'};
  ${props => props.position === 'fixed' && `
    top: ${props.top || '20px'};
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
  `}
`;

const MessageContent = styled.div`
  flex: 1;
  padding-right: ${theme.spacing.sm};
`;

const ErrorTitle = styled.div`
  font-weight: bold;
  margin-bottom: ${props => props.subtitle ? '4px' : '0'};
`;

const ErrorSubtitle = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  padding: 0 ${theme.spacing.xs};
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const RetryButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: 4px 8px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

/**
 * A component for showing inline error messages
 */
const ErrorMessage = ({ 
  title,
  subtitle,
  severity = 'error',
  onClose,
  onRetry,
  allowRetry = false,
  timeout = 0,
  position,
  maxWidth = '500px',
  top,
  margin,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  // Set up automatic timeout if specified
  React.useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [timeout, handleClose]);

  if (!isVisible) return null;

  return (
    <ErrorContainer 
      severity={severity} 
      isClosing={isClosing}
      position={position}
      maxWidth={maxWidth}
      top={top}
      margin={margin}
      {...props}
    >
      <MessageContent>
        <ErrorTitle subtitle={subtitle}>{title}</ErrorTitle>
        {subtitle && <ErrorSubtitle>{subtitle}</ErrorSubtitle>}
      </MessageContent>
      
      {allowRetry && onRetry && (
        <RetryButton onClick={onRetry}>Retry</RetryButton>
      )}
      
      {onClose && (
        <CloseButton onClick={handleClose} aria-label="Close">
          ×
        </CloseButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorMessage;