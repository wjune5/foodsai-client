# Guest Mode Warning System

This system provides comprehensive warnings to users when they are in guest mode and attempt actions that could result in data loss.

## Components

### 1. GuestModeIndicator
A React component that displays visual indicators when users are in guest mode.

**Features:**
- Floating indicator in top-right corner
- Optional banner at the top of the page
- Toast notifications for initial guest mode entry

**Usage:**
```tsx
import { GuestModeIndicator } from '@/shared/components/GuestModeIndicator';

// In your layout or page
<GuestModeIndicator 
  showBanner={true} 
  showToast={true} 
  className="custom-styles" 
/>
```

### 2. GuestModeWarningService
A singleton service that handles all guest mode warning scenarios.

**Warning Scenarios:**
- **Window Close**: Shows browser's native "Leave Site?" dialog
- **Tab Switch**: Toast notification when switching tabs
- **Page Navigation**: Warning when using browser back/forward
- **Page Refresh**: Warning before page reload
- **Manual Warning**: Programmatic warning display

**Usage:**
```tsx
import { GuestModeWarningService } from '@/shared/services/GuestModeWarningService';

// Initialize the service
const warningService = GuestModeWarningService.getInstance();
warningService.initialize();

// Show manual warning
warningService.showManualWarning();
```

### 3. useGuestModeWarning Hook
A React hook that provides guest mode warning functionality.

**Usage:**
```tsx
import { useGuestModeWarning } from '@/shared/hooks/useGuestModeWarning';

function MyComponent() {
  const { isGuestMode, showGuestModeWarning } = useGuestModeWarning();
  
  const handleImportantAction = () => {
    if (isGuestMode) {
      showGuestModeWarning();
    }
    // Proceed with action
  };
  
  return <div>...</div>;
}
```

## Integration

### 1. Layout Integration
Add the GuestModeIndicator to your main layout:

```tsx
// In your layout.tsx
import { GuestModeIndicator } from '@/shared/components/GuestModeIndicator';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <Navigation />
          <GuestModeIndicator />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Page-Level Warnings
Use the hook in specific pages where data loss is critical:

```tsx
// In inventory/add/page.tsx
import { useGuestModeWarning } from '@/shared/hooks/useGuestModeWarning';

export default function AddInventoryPage() {
  const { showGuestModeWarning } = useGuestModeWarning();
  
  const handleSave = () => {
    // Show warning before saving in guest mode
    showGuestModeWarning();
    // Proceed with save
  };
  
  return <div>...</div>;
}
```

## Warning Messages

### Browser Dialog (beforeunload)
```
"You are in guest mode. Your data is stored locally and may be lost if you leave this page. Are you sure you want to leave?"
```

### Toast Notifications
- **Initial Warning**: "👤 Guest Mode Active - Your data is stored locally on this device"
- **Tab Switch**: "💡 Guest Mode: Your data is saved locally"
- **Navigation**: "⚠️ Guest Mode: Navigation may cause data loss"
- **Manual Warning**: "⚠️ Guest Mode Warning - Your data is stored locally. Consider creating an account to save your data."

## Customization

### Styling
The components use Tailwind CSS classes and can be customized:

```tsx
<GuestModeIndicator 
  className="custom-positioning" 
  showBanner={false} // Hide banner
  showToast={false}   // Hide toast
/>
```

### Custom Warning Messages
Modify the GuestModeWarningService to customize warning messages:

```tsx
// In GuestModeWarningService.ts
private handleBeforeUnload(event: BeforeUnloadEvent) {
  // Custom message
  event.returnValue = 'Your custom warning message here';
  return event.returnValue;
}
```

## Best Practices

1. **Always show warnings** when users are in guest mode and about to perform actions that could cause data loss
2. **Use the service** for consistent warning behavior across the app
3. **Don't over-warn** - use the initial warning and then only for critical actions
4. **Provide clear actions** - tell users how to save their data (create account, export data)
5. **Test thoroughly** - ensure warnings work across different browsers and scenarios

## Browser Compatibility

- **beforeunload**: Works in all modern browsers
- **visibilitychange**: Works in all modern browsers
- **pagehide**: Works in all modern browsers
- **popstate**: Works in all modern browsers

## Troubleshooting

### Warnings not showing
1. Check if guest mode is properly initialized
2. Verify the service is initialized in the component
3. Check browser console for errors

### Too many warnings
1. Use the `warningShown` flag to prevent duplicate warnings
2. Adjust warning frequency in the service
3. Consider user preferences for warning frequency

### Custom warning scenarios
1. Extend the GuestModeWarningService with new event handlers
2. Add new methods for specific warning scenarios
3. Update the component to use new warning methods 