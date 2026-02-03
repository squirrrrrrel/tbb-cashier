import toast from 'react-hot-toast';

const DURATION = 2100;

const typeStyles = {
  success: { bar: '#14803c', bg: '#34b438' },
  error: { bar: '#8f2727', bg: '#ef4444' },
  warning: { bar: '#986916', bg: '#f59e0b' },
  info: { bar: '#2959a7', bg: '#2959a7' },
};

export const useNotification = () => {
  const showNotification = (message, type = 'success', title) => {
    const { bg, bar } = typeStyles[type];

    toast.custom(
      (t) => (
        <div
          style={{
            // --- TOP LAYER & POSITIONING ---
            position: 'relative',
            zIndex: 999999, // Maximum priority
            
            // --- EXIT ANIMATION LOGIC ---
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            maxHeight: t.visible ? '200px' : '0px',
            margin: t.visible ? '8px 0' : '0px',
            transition: 'all 300ms ease-in-out',
            
            // --- BOX STYLING ---
            background: bg,
            color: 'white',
            minWidth: '320px',
            borderRadius: '4px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)', // Increased shadow for depth
            overflow: 'hidden',
            display: 'flex',
            gap: '5px',
          }}
        >
          {/* Vertical Accent Bar */}
          <div style={{ width: '8px', background: bar, flexShrink: 0 }}></div>
          
          <div style={{ padding: '12px', flex: 1 }}>
            {/* Content */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '100%' }}>
                {title && (
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                    {title}
                  </div>
                )}
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{message}</div>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div
              style={{
                height: '4px',
                width: "100%",
                background: "rgba(255,255,255,0.2)",
                borderRadius: '10px',
                marginTop: '10px',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  height: '100%',
                  background: 'white',
                  animation: `toast-progress ${DURATION}ms linear forwards`,
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        duration: DURATION,
        position: 'top-right',
      }
    );
  };

  return {
    notifySuccess: (msg, title = 'SUCCESS') => showNotification(msg, 'success', title),
    notifyError: (msg, title = 'ERROR') => showNotification(msg, 'error', title),
    notifyWarning: (msg, title = 'WARNING') => showNotification(msg, 'warning', title),
    notifyInfo: (msg, title = 'INFO') => showNotification(msg, 'info', title),
  };
};