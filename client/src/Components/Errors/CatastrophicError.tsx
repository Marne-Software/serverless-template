import React from 'react';
import { Link } from 'react-router-dom';
import { FlexCol } from '../../Styles';

interface CatastrophicErrorProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const CatastrophicError: React.FC<CatastrophicErrorProps> = ({ error, resetErrorBoundary }) => {
  return (
    <FlexCol>
      <h1>Something went wrong...</h1>
      <h3>We apologize for the inconvenience, an unexpected error occurred.</h3>
      
      {/* Optionally display the error message for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <pre style={{ background: '#f8d7da', padding: '1rem', color: '#721c24' }}>
          {error.message}
        </pre>
      )}

      <button onClick={resetErrorBoundary}>Try again</button>
      <Link to="/" style={{ marginTop: '10px', display: 'inline-block' }}>Go to Home</Link>
    </FlexCol>
  );
};

export default CatastrophicError;
