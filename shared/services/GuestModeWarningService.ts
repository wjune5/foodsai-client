import { GuestModeService } from './GuestModeService';
import toast from 'react-hot-toast';

export class GuestModeWarningService {
  private static instance: GuestModeWarningService;
  private isInitialized = false;
  private warningShown = false;

  private constructor() {}

  static getInstance(): GuestModeWarningService {
    if (!GuestModeWarningService.instance) {
      GuestModeWarningService.instance = new GuestModeWarningService();
    }
    return GuestModeWarningService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Window close warning
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Tab visibility change warning
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Page hide warning (navigation, refresh)
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
    
    // Browser back/forward button warning
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  private handleBeforeUnload(event: BeforeUnloadEvent) {
    const guestModeService = GuestModeService.getInstance();
    if (guestModeService.isGuestModeActive() && guestModeService.getCurrentUser()) {
      event.preventDefault();
      event.returnValue = 'You are in guest mode. Your data is stored locally and may be lost if you leave this page. Are you sure you want to leave?';
      return event.returnValue;
    }
  }

  private handleVisibilityChange() {
    const guestModeService = GuestModeService.getInstance();
    if (guestModeService.isGuestModeActive() && document.visibilityState === 'hidden') {
      console.log('Showing tab switch warning');
      toast('💡 Guest Mode: Your data is saved locally', {
        duration: 3000,
        icon: '👤',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
        },
      });
    }
  }

  private handlePageHide() {
    const guestModeService = GuestModeService.getInstance();
    if (guestModeService.isGuestModeActive()) {
      toast('⚠️ Guest Mode: Your data is stored locally', {
        duration: 2000,
        icon: '⚠️',
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #f87171',
        },
      });
    }
  }

  private handlePopState() {
    const guestModeService = GuestModeService.getInstance();
    console.log('Pop state detected');
    if (guestModeService.isGuestModeActive()) {
      console.log('Showing navigation warning');
      toast('⚠️ Guest Mode: Navigation may cause data loss', {
        duration: 3000,
        icon: '⚠️',
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #f87171',
        },
      });
    }
  }

  showInitialWarning() {
    const guestModeService = GuestModeService.getInstance();
    if (guestModeService.isGuestModeActive() && !this.warningShown) {
      toast('👤 Guest Mode Active', {
        duration: 4000,
        icon: '👤',
        style: {
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #0ea5e9',
        },
      });
      this.warningShown = true;
    }
  }

  showManualWarning() {
    const guestModeService = GuestModeService.getInstance();
    if (guestModeService.isGuestModeActive()) {
      toast('⚠️ Guest Mode Warning', {
        duration: 5000,
        icon: '⚠️',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
        },
      });
    }
  }

  cleanup() {
    this.isInitialized = false;
    this.warningShown = false;
  }
} 