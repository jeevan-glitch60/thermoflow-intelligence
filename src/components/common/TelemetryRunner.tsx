import React, { useEffect } from 'react';
import { useFieldStore } from '../../store/useFieldStore';

export const TelemetryRunner: React.FC = () => {
  const { isTelemetryPaused, telemetryIntervalMs, tickTelemetry } = useFieldStore();

  useEffect(() => {
    if (isTelemetryPaused) return;

    const interval = setInterval(() => {
      tickTelemetry();
    }, telemetryIntervalMs);

    return () => clearInterval(interval);
  }, [isTelemetryPaused, telemetryIntervalMs, tickTelemetry]);

  return null;
};
