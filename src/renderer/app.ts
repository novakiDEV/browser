// Frontend TypeScript application for Electron
interface AppConfig {
    appName: string;
    version: string;
}

class ElectronBrowserApp {
    private config: AppConfig;
    private clickCount: number = 0;

    constructor(config: AppConfig) {
        this.config = config;
        this.init();
    }

    private init(): void {
        console.log(`Initializing ${this.config.appName} v${this.config.version}`);
        this.setupEventListeners();
        this.displayPlatformInfo();
    }

    private setupEventListeners(): void {
        const clickBtn = document.getElementById('clickBtn');
        const output = document.getElementById('output');

        if (clickBtn && output) {
            clickBtn.addEventListener('click', () => {
                this.handleButtonClick(output);
            });
        }
    }

    private displayPlatformInfo(): void {
        const platformElement = document.getElementById('platform');
        if (platformElement && window.electronAPI) {
            platformElement.textContent = window.electronAPI.platform;
        } else if (platformElement) {
            platformElement.textContent = 'Running in browser (not Electron)';
        }
    }

    private handleButtonClick(output: HTMLElement): void {
        this.clickCount++;
        const messages = [
            'Hello from Electron + TypeScript!',
            'Your browser app is working great!',
            'Click counter is working!',
            'Electron makes desktop apps easy!',
            'Keep clicking for more messages!'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        output.textContent = `${randomMessage} (Clicks: ${this.clickCount})`;
        
        console.log(`Button clicked ${this.clickCount} times`);
        
        // Example of using Electron API if available
        if (window.electronAPI) {
            window.electronAPI.send('toMain', {
                action: 'button-clicked',
                count: this.clickCount
            });
        }
    }

    public getClickCount(): number {
        return this.clickCount;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ElectronBrowserApp({
        appName: 'CNVRS Browser',
        version: '1.0.0'
    });

    // Make app available globally for debugging
    (window as any).app = app;
});

export { ElectronBrowserApp, AppConfig };
