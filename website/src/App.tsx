import { Download, FolderOpen, PaintBucket, Zap, Shield, ArrowRight, Code2, Layers, Cpu } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <PaintBucket className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">Tintd Pro</span>
            </div>
            <div className="flex gap-4">
              <a 
                href="#contribute" 
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Contribute
              </a>
              <a 
                href="https://github.com/momanamjad/Tinted-" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">Star on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight">
            Customize Windows <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Folders Like Magic.
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Apply stunning colors, beautiful icons, and custom styling to any folder on Windows. No registry hacks. No system bloat. Just right-click and transform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <a 
              href="https://github.com/momanamjad/Tinted-/releases/latest" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-primary/25"
            >
              <Download className="w-5 h-5" />
              Download for Windows
            </a>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">
              v0.1.0 &bull; Windows 10/11 &bull; Open Source
            </p>
          </div>
          
          {/* Mockup / Screenshot Area */}
          <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto px-4 sm:px-0">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <FolderOpen className="w-16 h-16 sm:w-24 sm:h-24 text-primary/50 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium text-sm sm:text-base">Tintd Pro Interface</p>
                </div>
              </div>
            </div>
            {/* Decorative blurs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[80px] sm:blur-[120px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Tintd Pro?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">Built for designers, developers, and power users who care about their workspace aesthetics.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-background border border-white/5 p-6 sm:p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <PaintBucket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">Infinite Colors</h3>
              <p className="text-gray-400 text-sm sm:text-base">Pick any hex code or use our curated palettes to color-code your projects instantly.</p>
            </div>
            
            <div className="bg-background border border-white/5 p-6 sm:p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">Auto-Styling</h3>
              <p className="text-gray-400 text-sm sm:text-base">Set it and forget it. Automatically apply icons to newly created folders based on matching names.</p>
            </div>
            
            <div className="bg-background border border-white/5 p-6 sm:p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">Native & Safe</h3>
              <p className="text-gray-400 text-sm sm:text-base">Uses native Windows desktop.ini files. No background processes required to keep icons visible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Under the Hood */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Modern Tech Stack</h2>
              <p className="text-gray-400 mb-8 text-sm sm:text-base leading-relaxed">
                Tintd Pro isn't just a basic script. It's a fully-fledged desktop application built using modern web technologies to ensure a smooth, fast, and beautiful experience.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center"><Layers className="w-4 h-4 text-blue-400" /></div>
                  <span className="font-medium">React & Vite</span>
                  <span className="text-gray-500 text-sm">— Lightning fast UI rendering</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center"><Code2 className="w-4 h-4 text-teal-400" /></div>
                  <span className="font-medium">Tailwind CSS</span>
                  <span className="text-gray-500 text-sm">— Premium dark mode aesthetic</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-500/10 flex items-center justify-center"><Cpu className="w-4 h-4 text-gray-400" /></div>
                  <span className="font-medium">Electron & SQLite</span>
                  <span className="text-gray-500 text-sm">— Deep Windows integration</span>
                </li>
              </ul>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-white/5 font-mono text-sm sm:text-base overflow-hidden">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-green-400">~/tintd-pro $</p>
              <p className="text-gray-300 mt-2">1. Analyzes target folder attributes</p>
              <p className="text-gray-300 mt-1">2. Dynamically generates custom .ico</p>
              <p className="text-gray-300 mt-1">3. Writes hidden desktop.ini configuration</p>
              <p className="text-gray-300 mt-1">4. Broadcasts SHChangeNotify to Windows</p>
              <p className="text-primary mt-2">✓ Folder successfully transformed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section id="contribute" className="py-16 sm:py-24 bg-primary/5 border-t border-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Code2 className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Calling All Developers</h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base max-w-2xl mx-auto">
            Tintd Pro is completely free and open-source. We are actively looking for contributors to help build new features, add more icon packs, and squash bugs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="https://github.com/momanamjad/Tinted-/issues" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium flex items-center justify-center gap-2"
            >
              View Open Issues <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="https://github.com/momanamjad/Tinted-/pulls" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors font-medium flex items-center justify-center gap-2"
            >
              Submit a PR
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <PaintBucket className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-400">Tintd Pro</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-500">
            <span>Built with <a href="https://react.dev/" className="hover:text-primary transition-colors">React</a> & <a href="https://tailwindcss.com/" className="hover:text-primary transition-colors">Tailwind CSS</a></span>
            <span>Icons by <a href="https://lucide.dev/" className="hover:text-primary transition-colors">Lucide</a></span>
            <span>Open Source under MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
