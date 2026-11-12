import logoImg from "../assets/logo.png";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-10">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left: Branding & Copyright */}
                <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 text-white font-bold text-lg mb-1">
                        <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden">
                            <img src={logoImg} alt="Reading Nova logo" className="w-full h-full object-contain" />
                        </div>
                        <span>Reading Nova</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">A perfect place for readers and writers</p>
                    <p className="text-xs text-slate-500">© 2026 Reading Nova. All rights reserved.</p>
                </div>

                {/* Right: Quick Links */}
                <div className="flex items-center gap-6 text-sm text-slate-300">
                    <a href="#home" className="hover:text-white transition-colors">Home</a>
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    <a href="#about" className="hover:text-white transition-colors">About</a>
                    <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
}
