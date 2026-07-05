import 'react-icons';
import React from 'react';

declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    className?: string;
  }
}
