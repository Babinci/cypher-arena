// components/SharedUI/ToastNotification.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import theme from '../../config/theme';

// Animation keyframes
const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

// Toast Container
const ToastContainer = styled.div`
  position: fixed;
  top: ${props => props.top || '20px'};
  right: ${props => props.right || '20px'};
  z-index: ${props => theme.zIndices.toast};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  
  & > * {
    pointer-events: auto;
  }
`;

// Individual Toast
const Toast = styled.div`
  display: flex;
  min-width: 250px;
  max-width: 350px;
  margin-bottom: 10px;
  padding: 12px 15px;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  align-items: center;
  animation: ${props => props.isClosing ? css`${slideOut} 0.3s forwards` : css`${slideIn} 0.3s`};
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return theme.colors.accentPrimary;
      case 'error':
        return theme.colors.accentTertiary;
      case 'warning':
        return '#FFC107';
      case 'info':
      default:
        return '#0DCAF0';
    }
  }};
  color: white;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: ${props => props.message ? '4px' : '0'};
`;

const ToastMessage = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-left: 8px;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

/**
 * Single toast notification component
 */
const ToastNotification = ({ 
  id,
  title, 
  message, 
  type = 'info',
  duration = 5000,
  onClose 
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) onClose(id);
    }, 300); // Wait for animation to complete
  };
  
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);
  
  return (
    <Toast type={type} isClosing={isClosing}>
      <ToastContent>
        {title && <ToastTitle message={message}>{title}</ToastTitle>}
        {message && <ToastMessage>{message}</ToastMessage>}
      </ToastContent>
      <CloseButton onClick={handleClose} aria-label="Close">
        ×
      </CloseButton>
    </Toast>
  );
};

/**
 * Toast manager component that maintains a list of active toasts
 */
const ToastManager = ({ position = { top: '20px', right: '20px' } }) => {
  const [toasts, setToasts] = useState([]);
  
  // Add a new toast
  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prevToasts => [...prevToasts, { id, ...toast }]);
    return id;
  };
  
  // Remove a toast by id
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  // Expose methods to parent components
  useEffect(() => {
    // Attach the addToast method to window for global access
    window.toastManager = {
      addToast,
      removeToast
    };
    
    // Clean up on unmount
    return () => {
      delete window.toastManager;
    };
  }, []);
  
  if (toasts.length === 0) return null;
  
  return (
    <ToastContainer top={position.top} right={position.right}>
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </ToastContainer>
  );
};

export default ToastManager;

// Helper function to show a toast from anywhere in the app
export const showToast = (options) => {
  if (window.toastManager) {
    return window.toastManager.addToast(options);
  }
  console.warn('Toast manager is not initialized');
  return null;
};

// Helper function to remove a toast
export const removeToast = (id) => {
  if (window.toastManager) {
    window.toastManager.removeToast(id);
  }
};