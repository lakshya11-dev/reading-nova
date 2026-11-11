const features = [
    {
        icon: "👥",
        title: "Student Profiles",
        desc: "Store and manage student information easily."
    },
    {
        icon: "🛡️",
        title: "Secure Authentication",
        desc: "Keep your data safe with secure login and access control."
    },
    {
        icon: "💳",
        title: "Subscriptions",
        desc: "Manage free and premium plans for your students."
    },
    {
        icon: "📍",
        title: "Address Management",
        desc: "Save and manage addresses with ease."
    }
];

export default function Features() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Heading */}
                <div className="text-center max-w-xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Features</h2>
                    <p className="text-slate-500">Everything you need to manage your students in one place.</p>
                </div>

                {/* 4-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
