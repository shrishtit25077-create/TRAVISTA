import React from 'react';

export default class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('Map component error (contained):', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full rounded-[2rem] overflow-hidden flex flex-col items-center justify-center gap-3 bg-[#f0f4f2]"
          style={{ height: 340, border: '1px solid rgba(47,111,94,0.12)' }}>
          <span className="text-3xl">🗺️</span>
          <p className="text-sm font-semibold text-[#2f6f5e]">Interactive map unavailable</p>
          <p className="text-xs text-[#9CA3AF]">Check console for details</p>
        </div>
      );
    }
    return this.props.children;
  }
}
