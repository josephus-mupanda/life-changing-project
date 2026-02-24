import React from 'react';

const ErrorPage = () => {
    return (
        <div style={{
            fontFamily: 'Inter, sans-serif',
            backgroundColor: '#f5f5f5',
            color: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            height: '100vh',
            padding: '40px'
        }}>
            <h1 style={{
                fontSize: '48px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                marginBottom: '16px'
            }}>
                Service Unavailable
            </h1>
            <p style={{
                fontSize: '18px',
                fontWeight: 400,
                color: '#333333'
            }}>
                We’re sorry, but the service is currently unavailable. Please try again later.
            </p>
        </div>
    );
};

export default ErrorPage;