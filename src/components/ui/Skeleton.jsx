import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  radius = '6px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
};
