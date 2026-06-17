import { useState, useEffect } from 'react';
import { Download, FolderOpen, PaintBucket, Zap, Shield, ArrowRight, Code2, Layers, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

function App() {
  const [latestVersion, setLatestVersion] = useState<string>('');

  useEffect(() => {
    fetch('https://api.github.com/repos/momanamjad/Tinted-/releases/latest')
      .then(res => res.json())
      .then(data => {
        if (data.tag_name) {
          setLatestVersion(data.tag_name);
        }
      })
      .catch(() => {
        // Silently fail — badge just won't show
      });
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-primary/30">
      
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] mix-blend-screen opacity-50"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <PaintBucket className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Tintd Pro</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <a href="#contribute" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-sm font-medium text-gray-300 hover:text-white">
                Contribute
              </a>
              <a 
                href="https://github.com/momanamjad/Tinted-" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-sm font-medium"
              >
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">Star on GitHub</span>
              </a>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 px-4">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto relative z-10 text-center"
        >
          {latestVersion && (
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 font-medium">
              <Sparkles className="w-4 h-4 text-accent" />
              Tintd Pro {latestVersion} is now available
            </span>
          </motion.div>
          )
          
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight">
            Customize Windows <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Folders Like Magic.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed">
            Apply stunning colors, beautiful icons, and custom styling to any folder on Windows. No registry hacks. No system bloat. Just right-click and transform your workspace.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <a 
              href="https://github.com/momanamjad/Tinted-/releases/latest" 
              target="_blank" 
              rel="noreferrer"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Download className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Download for Windows</span>
            </a>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 font-medium text-left">
              Free & Open Source <br className="hidden sm:block" /> Windows 10/11
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 max-w-xl mx-auto px-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-left">
              <p className="text-yellow-200/90 text-sm font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Installation Note
              </p>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                Windows may show a <strong>"Windows protected your PC"</strong> screen because this is a new open-source app. Click <strong>"More info"</strong> then <strong>"Run anyway"</strong> to install.
              </p>
              <div className="bg-black/50 rounded-lg p-2 flex items-center justify-between border border-white/5">
                <code className="text-[10px] text-gray-300 font-mono">
                  powershell -command "Unblock-File -Path '.\Tintd Pro-Setup.exe'"
                </code>
                <span className="text-[10px] text-gray-500 ml-2">(Optional bypass)</span>
              </div>
            </div>
          </motion.div>
          
          {/* Mockup Area */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="mt-16 sm:mt-24 relative max-w-5xl mx-auto px-4 sm:px-0"
          >
            <div className="aspect-video bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)] overflow-hidden relative group">
              <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
                <FolderOpen className="w-16 h-16 sm:w-24 sm:h-24 text-accent/50 mx-auto mb-6" />
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                  <div className="w-8 h-8 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  <div className="w-8 h-8 rounded-full bg-accent shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
                </div>
              </div>
              
              {/* App window frame simulation */}
              <div className="absolute top-0 w-full h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16 sm:mb-24"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Why Tintd Pro?</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-lg">Built for designers, developers, and power users who care about their workspace aesthetics.</motion.p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: PaintBucket, title: "Infinite Colors", desc: "Pick any hex code or use our curated palettes to color-code your projects instantly." },
              { icon: Zap, title: "Auto-Styling", desc: "Set it and forget it. Automatically apply icons to newly created folders based on matching names." },
              { icon: Shield, title: "Native & Safe", desc: "Uses native Windows desktop.ini files. No background processes required to keep icons visible." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-primary/50 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack & Under the Hood */}
      <section className="py-20 sm:py-32 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Modern Tech Stack</motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 mb-8 text-lg leading-relaxed">
                Tintd Pro isn't just a basic script. It's a fully-fledged desktop application built using modern web technologies to ensure a smooth, fast, and secure experience.
              </motion.p>
              <motion.ul variants={staggerContainer} className="space-y-6">
                {[
                  { icon: Layers, color: "text-blue-400", bg: "bg-blue-400/10", title: "React & Vite", desc: "Lightning fast UI rendering and developer experience." },
                  { icon: PaintBucket, color: "text-teal-400", bg: "bg-teal-400/10", title: "Tailwind CSS", desc: "Highly polished, responsive, and dark-mode optimized design." },
                  { icon: Cpu, color: "text-gray-300", bg: "bg-gray-400/10", title: "Electron & SQLite", desc: "Deep Windows shell integration with persistent local data." }
                ].map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-lg">{item.title}</span>
                      <span className="text-gray-500 text-sm mt-1 block">{item.desc}</span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-[#0c0c0c] rounded-3xl p-6 sm:p-8 border border-white/10 font-mono text-sm sm:text-base overflow-hidden shadow-2xl relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="space-y-2 relative z-10">
                <p className="text-accent font-semibold">~/tintd-pro $ <span className="text-white font-normal">apply --color #6366f1</span></p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400">► Analyzing target folder attributes...</motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.0 }} className="text-gray-400">► Generating custom .ico hash buffer...</motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-gray-400">► Writing hidden desktop.ini configuration...</motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.0 }} className="text-gray-400">► Broadcasting SHChangeNotify to Windows...</motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-green-400 mt-4 font-bold">✓ Folder successfully transformed</motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section id="contribute" className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <motion.div variants={fadeUp} className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl mx-auto flex items-center justify-center mb-8 border border-white/20">
            <Code2 className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Calling All Developers</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 mb-10 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Tintd Pro is completely free and open-source. We are actively looking for contributors to help build new features, add more icon packs, and squash bugs.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="https://github.com/momanamjad/Tinted-/issues" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors font-medium flex items-center justify-center gap-2 text-lg"
            >
              View Open Issues
            </a>
            <a 
              href="https://github.com/momanamjad/Tinted-/pulls" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 rounded-full bg-white text-black hover:scale-105 transition-transform font-bold flex items-center justify-center gap-2 text-lg"
            >
              Submit a PR <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <PaintBucket className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-gray-400 tracking-tight">Tintd Pro</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600 font-medium">
            <span>Built with <a href="https://react.dev/" className="text-gray-400 hover:text-white transition-colors">React</a>, <a href="https://tailwindcss.com/" className="text-gray-400 hover:text-white transition-colors">Tailwind</a> & <a href="https://framer.com/motion/" className="text-gray-400 hover:text-white transition-colors">Framer Motion</a></span>
            <span>Icons by <a href="https://lucide.dev/" className="text-gray-400 hover:text-white transition-colors">Lucide</a></span>
            <span>Open Source (MIT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
