import React from 'react';
import { RowSection, GridSection, HeroSection } from './SectionComponents';

export default function SectionRenderer({ section, onMapClick }) {
  switch (section.type) {
    case 'row':
      return <RowSection {...section} onMapClick={onMapClick} />;
    case 'grid':
      return <GridSection {...section} onMapClick={onMapClick} />;
    case 'hero':
      return <HeroSection {...section} onMapClick={onMapClick} />;
    default:
      return null;
  }
}
