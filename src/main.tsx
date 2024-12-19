import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AwsRum, AwsRumConfig } from 'aws-rum-web';

try {
  const config: AwsRumConfig = {
    sessionSampleRate: 1,
    identityPoolId: "ap-southeast-2:d4361ad1-a845-40ea-b49a-a387b8d0ec3e",
    endpoint: "https://dataplane.rum.ap-southeast-2.amazonaws.com",
    telemetries: ["performance","errors",["http", { recordAllRequests: true }]],
    allowCookies: true,
    enableXRay: false,
    enableRumClient: true,
  };

  const APPLICATION_ID: string = '613264ec-c357-429d-9c27-4bd36bb34575';
  const APPLICATION_VERSION: string = '1.0.0';
  const APPLICATION_REGION: string = 'ap-southeast-2';

  // Initialize AWS RUM
  void new AwsRum(
    APPLICATION_ID,
    APPLICATION_VERSION,
    APPLICATION_REGION,
    config
  );
} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
}

// Get the container element
const container = document.getElementById('root');

// Ensure the container exists
if (!container) {
  throw new Error('Root element not found');
}

// Create root only if it hasn't been created before
const root = ReactDOM.createRoot(container);

// Initial render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Handle HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Cleanup any subscriptions/references here if needed
  });
}
