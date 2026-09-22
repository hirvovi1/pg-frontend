interface HealthToggleButtonProps {
  healthWidget: boolean;
  onToggleWidget: () => void;
  widgetAlertLevel?: 'red' | 'yellow' | 'green' | null;
}

export function HealthToggleButton({
  healthWidget,
  onToggleWidget,
  widgetAlertLevel = null // Oletuksena null (vihreä tai ei aktiivista hälytystä)
}: HealthToggleButtonProps) {
  return (
    <button
      className="toolbar-btn"
      type="button"
      onClick={onToggleWidget}
      style={{
        background: healthWidget ? '#e4e4e7' : '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        padding: '4px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span
        aria-label={widgetAlertLevel ? `${widgetAlertLevel} alert` : 'no active alert'}
        title={widgetAlertLevel ? `${widgetAlertLevel} alert active` : 'no active alert'}
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: widgetAlertLevel === 'red' ? '#ef4444' : widgetAlertLevel === 'yellow' ? '#facc15' : '#22c55e',
          boxShadow: widgetAlertLevel ? '0 0 0 2px rgba(255,255,255,0.8)' : 'none',
        }}
      />
      {healthWidget ? "Hide Health Radar" : "Show Health Radar"}
    </button>
  );
}
