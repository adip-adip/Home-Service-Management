/**
 * Services Page - Premium Human-Crafted Design
 * Clean, organized service listings with refined aesthetics
 */

import { Link } from 'react-router-dom';
import {
    FiArrowRight,
    FiCheckCircle,
    FiClock,
    FiShield,
    FiStar,
    FiSearch,
    FiChevronRight,
    FiPhone,
    FiMail,
    FiMapPin
} from 'react-icons/fi';
import { Navbar } from '../components/layout';

const serviceCategories = [
    {
        name: 'Plumbing',
        icon: '🔧',
        description: 'Leak repair, pipe installation, drainage fixes and bathroom fittings by certified experts.',
        startingPrice: 'Rs. 1,200',
        popular: true,
        services: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Bathroom Fittings']
    },
    {
        name: 'Electrical',
        icon: '⚡',
        description: 'Wiring, switchboard repair, lighting setup and comprehensive safety inspections.',
        startingPrice: 'Rs. 1,000',
        popular: true,
        services: ['Wiring', 'Switchboard Repair', 'Lighting Setup', 'Safety Inspection']
    },
    {
        name: 'Home Cleaning',
        icon: '✨',
        description: 'Deep cleaning, kitchen and bathroom sanitization, move-in/out cleaning services.',
        startingPrice: 'Rs. 1,500',
        popular: true,
        services: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization', 'Move-in Cleaning']
    },
    {
        name: 'Carpentry',
        icon: '🪵',
        description: 'Furniture assembly, repairs, custom shelving, and quality wooden fittings.',
        startingPrice: 'Rs. 1,400',
        popular: false,
        services: ['Furniture Assembly', 'Wood Repair', 'Custom Shelving', 'Door Fitting']
    },
    {
        name: 'Painting',
        icon: '🎨',
        description: 'Interior and exterior painting with premium finishes and surface preparation.',
        startingPrice: 'Rs. 3,000',
        popular: false,
        services: ['Interior Painting', 'Exterior Painting', 'Wall Texturing', 'Waterproofing']
    },
    {
        name: 'AC Services',
        icon: '❄️',
        description: 'AC maintenance, gas refill, installation and expert troubleshooting for all brands.',
        startingPrice: 'Rs. 1,800',
        popular: true,
        services: ['AC Repair', 'Gas Refill', 'Installation', 'Annual Maintenance']
    },
    {
        name: 'Appliance Repair',
        icon: '🔌',
        description: 'Repair services for washing machines, refrigerators, ovens and home appliances.',
        startingPrice: 'Rs. 1,300',
        popular: false,
        services: ['Washing Machine', 'Refrigerator', 'Microwave', 'Water Heater']
    },
    {
        name: 'Pest Control',
        icon: '🐛',
        description: 'Safe and effective pest treatments for residential and commercial spaces.',
        startingPrice: 'Rs. 2,000',
        popular: false,
        services: ['General Pest Control', 'Termite Treatment', 'Cockroach Control', 'Bed Bug Treatment']
    },
    {
        name: 'Gardening',
        icon: '🌱',
        description: 'Garden cleanup, trimming, plant care and professional landscaping support.',
        startingPrice: 'Rs. 1,100',
        popular: false,
        services: ['Garden Cleanup', 'Lawn Mowing', 'Plant Care', 'Landscaping']
    }
];

const highlights = [
    {
        icon: FiShield,
        title: 'Verified Professionals',
        description: 'Every provider undergoes background checks and skill verification before joining our platform.'
    },
    {
        icon: FiClock,
        title: 'Flexible Scheduling',
        description: 'Book morning, afternoon or evening slots. Same-day service available for urgent needs.'
    },
    {
        icon: FiStar,
        title: 'Quality Guaranteed',
        description: 'Not satisfied with the work? We\'ll make it right or refund your payment. No questions asked.'
    }
];

const Services = () => {
    return (
        <div className="min-h-screen bg-slate-25">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6">
                            <span className="w-2 h-2 bg-brand-400 rounded-full" />
                            <span className="text-brand-300 text-sm font-medium">500+ verified professionals</span>
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                            Professional services for every home need
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
                            From plumbing emergencies to routine maintenance, find trusted experts for all your home service needs. Quality work, guaranteed satisfaction.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="What service do you need?"
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-all backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="py-16 px-4 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {highlights.map((item, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                                    <item.icon className="w-6 h-6 text-brand-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">All Services</h2>
                        <p className="text-slate-600 text-lg max-w-2xl">
                            Browse our complete range of home services. Each category is staffed with verified, experienced professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {serviceCategories.map((service, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 card-lift overflow-hidden"
                            >
                                <div className="p-6">
                                    {service.popular && (
                                        <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full mb-4">
                                            Popular
                                        </span>
                                    )}
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-4xl">{service.icon}</span>
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <FiCheckCircle className="w-3 h-3" />
                                            Available
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">
                                        {service.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        {service.description}
                                    </p>

                                    {/* Service Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {service.services.slice(0, 3).map((s, i) => (
                                            <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                {s}
                                            </span>
                                        ))}
                                        {service.services.length > 3 && (
                                            <span className="text-xs text-slate-400">+{service.services.length - 3} more</span>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500">Starting from</span>
                                        <p className="text-lg font-bold text-slate-900">{service.startingPrice}</p>
                                    </div>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors group-hover:gap-2.5"
                                    >
                                        Book Now
                                        <FiChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Need help right now?
                    </h2>
                    <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
                        Create your free account and book a trusted professional in just a few minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl transition-all hover:bg-brand-50 shadow-lg hover:shadow-xl active:scale-[0.98]">
                                Get Started Free
                                <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-xl border-2 border-brand-400 transition-all hover:bg-brand-500/80">
                                I Already Have an Account
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                                    <span className="text-white text-lg">🏠</span>
                                </div>
                                <span className="font-bold text-xl text-white">HomeService</span>
                            </div>
                            <p className="text-slate-500 leading-relaxed">
                                Your trusted platform for all home service needs.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Services</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-white transition-colors">Plumbing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Electrical</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cleaning</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">All Services</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <FiMail className="text-slate-500" />
                                    <span>support@homeservice.com</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FiPhone className="text-slate-500" />
                                    <span>+977 9800000000</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FiMapPin className="text-slate-500 mt-0.5" />
                                    <span>Kathmandu, Nepal</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
                        <p>© 2026 HomeService. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Services;
