// FontPreloader.js
// This component ensures fonts are loaded in the DOM before canvas operations

import React from 'react';

const FontPreloader = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      visibility: 'hidden',
      fontSize: '72px',
      fontFamily: 'Oswald',
      fontWeight: 'bold'
    }}>
      {/* Preload various font weights and styles */}
      <span style={{ fontWeight: '400' }}>Oswald Regular</span>
      <span style={{ fontWeight: '500' }}>Oswald Medium</span>
      <span style={{ fontWeight: '600' }}>Oswald SemiBold</span>
      <span style={{ fontWeight: '700' }}>Oswald Bold</span>
      <span style={{ fontWeight: 'bold' }}>Oswald Bold</span>
      <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Oswald Bold Italic</span>
      {/* Include all characters that might be used */}
      <span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
      <span>abcdefghijklmnopqrstuvwxyz</span>
      <span>0123456789</span>
      <span>{'!@#$%^&*()_+-=[]{}|;\':",./<?'}</span>
    </div>
  );
};

export default FontPreloader;