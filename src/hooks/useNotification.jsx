import toast from 'react-hot-toast';

const DURATION = 3000;

const typeStyles = {
  success: {
    bg: '#e6f9f0',
    bar: '#22c55e',
    icon: '✅',
  },
  error: {
    bg: '#fde8e8',
    bar: '#ef4444',
    icon: '❌',
  },
  warning: {
    bg: '#fff7e6',
    bar: '#f59e0b',
    icon: '⚠️',
  },
  info: {
    bg: '#e6f0ff',
    bar: '#3b82f6',
    icon: 'ℹ️',
  },
};

export const useNotification = () => {
  const showNotification = (message, type = 'success', title) => {
    const { bg, bar, icon } = typeStyles[type];

    toast.custom(
      (t) => (
        <div
          style={{
            background: bg,
            color: '#333',
            minWidth: '320px',
            borderRadius: '10px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Content */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>{icon}</div>
            <div>
              {title && (
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {title}
                </div>
              )}
              <div style={{ fontSize: '14px' }}>{message}</div>
            </div>
          </div>

          {/* Timer bar */}
          <div
            style={{
              height: '4px',
              background: bar,
              animation: `toast-progress ${DURATION}ms linear forwards`,
            }}
          />
        </div>
      ),
      {
        duration: DURATION,
        position: 'top-right',
      }
    );
  };

  return {
    notifySuccess: (msg, title = 'Success') =>
      showNotification(msg, 'success', title),

    notifyError: (msg, title = 'Error') =>
      showNotification(msg, 'error', title),

    notifyWarning: (msg, title = 'Warning') =>
      showNotification(msg, 'warning', title),

    notifyInfo: (msg, title = 'Info') =>
      showNotification(msg, 'info', title),
  };
};


