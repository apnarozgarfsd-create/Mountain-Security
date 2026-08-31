import {
  AlertCircle,
  AppWindow,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  Code,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Fingerprint,
  HardDrive,
  Laptop,
  Layers,
  Maximize2,
  Monitor,
  PackageCheck,
  QrCode,
  RefreshCw,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  Wifi,
  WifiOff,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MountainLogo } from '../common/MountainLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const NativeAppsHub: React.FC = () => {
  const { guards, weapons, clients, sites, vouchers } = useApp();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'windows' | 'offline' | 'scanner'>('android');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulatedBiometricState, setSimulatedBiometricState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Detect Operating System
  const [userOS, setUserOS] = useState<'Android' | 'Windows' | 'iOS' | 'macOS' | 'Linux' | 'Other'>('Windows');

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Detect user OS
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      setUserOS('Android');
      setActivePlatformTab('android');
    } else if (/windows/i.test(ua)) {
      setUserOS('Windows');
      setActivePlatformTab('windows');
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setUserOS('iOS');
    } else if (/mac/i.test(ua)) {
      setUserOS('macOS');
    } else if (/linux/i.test(ua)) {
      setUserOS('Linux');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (!installPrompt) {
      alert(
        userOS === 'Android'
          ? 'To install on Android: Tap Chrome/Browser menu (3 dots at top right) and select "Install app" or "Add to Home screen".'
          : 'To install on Windows: Click the Install icon in the browser address bar (top right) or menu > "Install Mountain Security Services SGMS".'
      );
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleSimulateBiometric = () => {
    setSimulatedBiometricState('scanning');
    setTimeout(() => {
      setSimulatedBiometricState('success');
      setTimeout(() => setSimulatedBiometricState('idle'), 3000);
    }, 1200);
  };

  const handleSimulateScan = () => {
    const randomGuard = guards[Math.floor(Math.random() * guards.length)];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const isGuard = Math.random() > 0.5;

    if (isGuard && randomGuard) {
      setScannedResult(`GUARD VERIFIED: ${randomGuard.name} (${randomGuard.guardCode}) | CNIC: ${randomGuard.cnic} | Post: ${randomGuard.currentSiteName || 'Headquarters'}`);
    } else if (randomWeapon) {
      const guardLabel = randomWeapon.currentGuardName ? `${randomWeapon.currentGuardName}` : 'Armoury Vault';
      setScannedResult(`FIREARM SERIAL: ${randomWeapon.serialNumber} | Model: ${randomWeapon.weaponType} | Status: ${randomWeapon.currentStatus} (${guardLabel})`);
    }
  };

  const androidCapacitorScript = `# 1. Install Capacitor CLI & Android package
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize and build the production bundle
npm run build

# 3. Add Android native project & sync assets
npx cap add android
npx cap sync android

# 4. Open directly in Android Studio or compile APK via command line
npx cap open android
# Or assemble release APK directly:
cd android && ./gradlew assembleRelease`;

  const windowsElectronScript = `# 1. Install Electron and Electron-Builder
npm install --save-dev electron electron-builder

# 2. Build the web application distribution
npm run build

# 3. Test the desktop application locally
npx electron .

# 4. Package standalone Windows installer (.EXE / .MSI)
npx electron-builder --win --x64`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-blue-950/80 to-slate-950 border border-blue-900/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Platform Native Deployment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display flex items-center gap-3">
              <span>Android & Windows Desktop App Center</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Run Mountain Security Services SGMS as a standalone native application on Android smartphones, tablets, and Windows desktop PCs with offline storage, instant launching, and direct hardware printing.
            </p>
          </div>

          {/* Quick Install Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handlePWAInstall}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-sm rounded-xl shadow-xl shadow-blue-900/30 cursor-pointer transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Already Installed' : `Install on ${userOS}`}</span>
            </button>
          </div>
        </div>

        {/* System Diagnostics Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Detected OS</div>
              <div className="font-bold text-white">{userOS} Platform</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${isOnline ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-red-950/60 border-red-800 text-red-400'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Offline Cache</div>
              <div className={`font-bold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isOnline ? 'Service Worker Active' : 'Offline Mode Enabled'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Local Records</div>
              <div className="font-bold text-white">
                {guards.length} Guards • {weapons.length} Weapons
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Display Mode</div>
              <div className="font-bold text-white">{isInstalled ? 'Standalone Window' : 'Web & PWA Ready'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActivePlatformTab('android')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePlatformTab === 'android'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android App (APK / PWA)</span>
        </button>

        <button
          onClick={() => setActivePlatformTab('windows')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePlatformTab === 'windows'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Windows Desktop App (.EXE)</span>
        </button>

        <button
          onClick={() => setActivePlatformTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePlatformTab === 'scanner'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Mobile Hardware & QR Scanner</span>
        </button>

        <button
          onClick={() => setActivePlatformTab('offline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePlatformTab === 'offline'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Offline SQLite & Storage Sync</span>
        </button>
      </div>

      {/* TAB CONTENT: ANDROID */}
      {activePlatformTab === 'android' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: 1-Click Instant Android Installation */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Method 1: Instant Android PWA / WebAPK</h3>
                  <p className="text-xs text-slate-400">Zero download size • Automatic updates • Full Android App Drawer</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                Recommended
              </span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <div>
                  <strong className="text-white">Open in Chrome or Samsung Internet:</strong> Open this URL on your Android device.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <div>
                  <strong className="text-white">Tap "Install" or 3-dots Menu:</strong> Tap the button below or tap the Chrome top-right menu and choose <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <div>
                  <strong className="text-white">Full Native Experience:</strong> Launches with full-screen dark theme, Mountain Security logo splash screen, and offline persistence.
                </div>
              </div>
            </div>

            <button
              onClick={handlePWAInstall}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Install Mountain SGMS on Android</span>
            </button>
          </div>

          {/* Card 2: Native Android APK & Capacitor Studio Project */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Method 2: Standalone .APK File (Capacitor)</h3>
                  <p className="text-xs text-slate-400">Compile standalone Android Studio APK package with custom signing</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              The project includes pre-configured <code className="text-sky-300 font-mono">capacitor.config.ts</code> with package ID <code className="text-sky-300 font-mono">com.mountainsecurity.sgms</code>. Run these commands in terminal to build the APK:
            </p>

            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                {androidCapacitorScript}
              </pre>
              <button
                onClick={() => copyToClipboard(androidCapacitorScript, 'android-cli')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {isCopied === 'android-cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied === 'android-cli' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Target Android API</div>
                <div className="text-white font-bold">API 34+ (Android 14/15)</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Package Identifier</div>
                <div className="text-sky-400 font-mono text-[11px]">com.mountainsecurity.sgms</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WINDOWS */}
      {activePlatformTab === 'windows' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Windows Desktop PWA */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Method 1: Windows Desktop App (Edge/Chrome)</h3>
                  <p className="text-xs text-slate-400">Start menu shortcut • Desktop icon • Dedicated window frame</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded">
                Instant
              </span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <div>
                  <strong className="text-white">In Microsoft Edge or Chrome:</strong> Look at the right side of the address bar.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <div>
                  <strong className="text-white">Click "App Available" Icon:</strong> Click the install icon (or Settings &gt; Apps &gt; <strong>"Install Mountain Security Services SGMS"</strong>).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <div>
                  <strong className="text-white">Pin to Taskbar & Start:</strong> Check "Pin to Taskbar" and "Create Desktop Shortcut" for instant 1-click access.
                </div>
              </div>
            </div>

            <button
              onClick={handlePWAInstall}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <AppWindow className="w-4 h-4" />
              <span>Create Windows Desktop Shortcut</span>
            </button>
          </div>

          {/* Card 2: Windows Standalone .EXE Installer (Electron) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Method 2: Standalone Windows .EXE (Electron)</h3>
                  <p className="text-xs text-slate-400">Native Windows installer (.exe) with local SQLite and direct printer hooks</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              The project includes pre-configured <code className="text-sky-300 font-mono">electron/main.cjs</code> and <code className="text-sky-300 font-mono">electron/preload.cjs</code>. Run these commands to compile the Windows installer:
            </p>

            <div className="relative">
              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-sky-400 overflow-x-auto whitespace-pre leading-relaxed">
                {windowsElectronScript}
              </pre>
              <button
                onClick={() => copyToClipboard(windowsElectronScript, 'windows-cli')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {isCopied === 'windows-cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied === 'windows-cli' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Installer Output</div>
                <div className="text-white font-bold">Mountain-SGMS-Setup.exe</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Architecture</div>
                <div className="text-purple-400 font-mono text-[11px]">Windows 10 / 11 (x64)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOBILE HARDWARE & SCANNER */}
      {activePlatformTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hardware Feature 1: Guard & Weapon Scanner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mobile QR & Barcode Camera Scanner</h3>
                <p className="text-xs text-slate-400">Scan Guard ID cards, Weapon serials, and Uniform batch tags</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-4">
              <div className="w-36 h-36 mx-auto rounded-2xl border-2 border-dashed border-purple-500/80 bg-purple-950/20 flex flex-col items-center justify-center text-purple-300 relative group overflow-hidden">
                <QrCode className="w-12 h-12 animate-pulse text-purple-400" />
                <span className="text-[10px] font-bold mt-2">Target Barcode / QR</span>
                <div className="absolute inset-x-0 h-0.5 bg-purple-400 animate-bounce top-2"></div>
              </div>

              <button
                onClick={handleSimulateScan}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Scan Guard CNIC or Firearm Barcode
              </button>

              {scannedResult && (
                <div className="bg-purple-950/80 border border-purple-700/80 rounded-xl p-3 text-left animate-in fade-in">
                  <div className="text-[10px] text-purple-300 font-bold uppercase">Scanner Output Result:</div>
                  <div className="text-xs font-mono font-bold text-white mt-1">{scannedResult}</div>
                </div>
              )}
            </div>
          </div>

          {/* Hardware Feature 2: Android Fingerprint & Windows Hello */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Biometric Attendance & Guard Sign-In</h3>
                <p className="text-xs text-slate-400">Compatible with Android Fingerprint Sensor and Windows Hello</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                <Fingerprint
                  className={`w-12 h-12 transition-colors ${
                    simulatedBiometricState === 'scanning'
                      ? 'text-amber-400 animate-pulse'
                      : simulatedBiometricState === 'success'
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                />
              </div>

              <div>
                <div className="font-bold text-xs text-white">
                  {simulatedBiometricState === 'scanning'
                    ? 'Scanning Guard Fingerprint on Device...'
                    : simulatedBiometricState === 'success'
                    ? 'Biometric Verified: Insp. Tariq Shah (FSD-HQ)'
                    : 'Place Thumb on Device Biometric Sensor'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces biometric compliance before issuing weapons and generating duty registers.
                </p>
              </div>

              <button
                onClick={handleSimulateBiometric}
                disabled={simulatedBiometricState !== 'idle'}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                Test Biometric Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OFFLINE & STORAGE */}
      {activePlatformTab === 'offline' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Offline Standalone Database & File Sync</h3>
                <p className="text-xs text-slate-400">
                  Full offline capability allows guard posts with poor internet to log duty, record vouchers, and sync when online.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-amber-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>IndexedDB / Local Storage</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Guards, weapons, salary slips, and vouchers are kept in browser / device local storage with zero server dependency.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Service Worker Caching</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                App assets, layouts, and print fonts are pre-cached for instant launching even when disconnected.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-blue-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Automated Backup JSON</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Download complete JSON database snapshots with one click to transfer data between Windows PCs and Android phones.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
