import { Download, FolderOpen, PaintBucket, Zap, Shield, ArrowRight } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <PaintBucket className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">Tintd Pro</span>
            </div>
            <div>
              <a 
                href="https://github.com/momanamjad/Tinted-/releases/latest" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                GitHub <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Customize Windows <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Folders Like Magic.
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Apply stunning colors, beautiful icons, and custom styling to any folder on Windows. No registry hacks. No system bloat. Just right-click and transform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://github.com/momanamjad/Tinted-/releases/latest" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-primary/25"
            >
              <Download className="w-5 h-5" />
              Download for Windows
            </a>
            <p className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">
              v0.1.0 &bull; Windows 10/11 &bull; Free & Open Source
            </p>
          </div>
          
          {/* Mockup / Screenshot Area */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FolderOpen className="w-24 h-24 text-primary/50 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Beautiful interface awaits.</p>
                </div>
              </div>
            </div>
            {/* Decorative blurs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-primary/20 blur-[120px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Tintd Pro?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Built for designers, developers, and power users who care about their workspace aesthetics.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background border border-white/5 p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <PaintBucket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Infinite Colors</h3>
              <p className="text-gray-400">Pick any hex code or use our curated palettes to color-code your projects instantly.</p>
            </div>
            
            <div className="bg-background border border-white/5 p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto-Styling</h3>
              <p className="text-gray-400">Set it and forget it. Automatically apply icons to newly created folders based on matching names.</p>
            </div>
            
            <div className="bg-background border border-white/5 p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Native & Safe</h3>
              <p className="text-gray-400">Uses native Windows desktop.ini files. No background processes required to keep the icons visible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <PaintBucket className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-400">Tintd Pro</span>
          </div>
          <p className="text-sm text-gray-500">
            Open Source under MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
