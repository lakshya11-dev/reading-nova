import heroStudent from '../assets/hero-student.jpg';

export default function Hero() {
    return (
        <section className="py-20 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Text Content */}
                <div className="max-w-xl">
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
                        Manage Your <br />
                        <span className="text-blue-600">Students Smarter</span>
                    </h1>
                    <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                        A simple and easy-to-use platform to manage student information,
                        profiles and subscriptions.
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer">
                            Get Started
                        </button>
                        <button className="px-6 py-3 font-semibold text-slate-700 hover:text-blue-600 border border-slate-300 hover:border-blue-400 bg-white rounded-lg transition-all cursor-pointer">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="flex-1 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-60 transform scale-90"></div>
                        <img
                            src={heroStudent}
                            alt="Student studying illustration"
                            className="relative w-full max-w-lg object-contain rounded-2xl shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
