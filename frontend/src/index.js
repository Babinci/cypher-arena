import { AppRegistry } from 'react-native';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Register the app component
AppRegistry.registerComponent('App', () => App);

// Detect if the app is running in a web environment
if (document.getElementById('root')) {
  AppRegistry.runApplication('App', {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
} else {
  // Mobile and other platforms can be handled here if needed
}

// Performance monitoring can still be used as needed
reportWebVitals(console.log);