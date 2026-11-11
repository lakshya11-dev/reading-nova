const plans = [
    {
        name: "Free",
        subtitle: "Perfect for small teams and basic needs.",
        price: "$0",
        features: [
            "Manage up to 50 students",
            "Basic profile management",
            "Email support"
        ],
        buttonText: "Get Started",
        popular: false
    },
    {
        name: "Silver",
        subtitle: "For growing institutions and schools.",
        price: "$19",
        features: [
            "Manage up to 500 students",
            "Advanced reporting",
            "Priority support"
        ],
        buttonText: "Choose Silver",
        popular: true
    },
    {
        name: "Gold",
        subtitle: "For large institutions and universities.",
        price: "$49",
        features: [
            "Unlimited students",
            "All premium features",
            "24/7 customer support"
        ],
        buttonText: "Choose Gold",
        popular: false
    }
];

export default function Pricing() {
    return (
        <section className="py-20 bg-slate-50/50">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Heading */}
                <div className="text-center max-w-xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Simple Pricing</h2>
                    <p className="text-slate-500">Choose a plan that fits your needs.</p>
                </div>

                {/* 3 Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl p-8 flex flex-col justify-between shadow-sm transition-shadow hover:shadow-md ${plan.popular ? "border-2 border-blue-600 ring-4 ring-blue-50" : "border border-slate-200"
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <span className="absolute -top-3.5 right-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    Most Popular
                                </span>
                            )}

                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-4 min-h-[40px]">{plan.subtitle}</p>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500 text-sm">/month</span>
                                </div>

                                {/* Features List */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                                            <span className="text-blue-600 font-bold">✓</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Button */}
                            <button
                                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${plan.popular
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                    : "border border-slate-200 text-blue-600 hover:border-blue-600 hover:bg-blue-50"
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
