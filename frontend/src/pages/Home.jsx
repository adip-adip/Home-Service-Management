/**
 * Home Page - Premium Human-Crafted Design
 * Inspired by Stripe, Linear and Notion
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiArrowRight,
    FiStar,
    FiShield,
    FiClock,
    FiCheck,
    FiMapPin,
    FiPhone,
    FiMail,
    FiChevronRight
} from 'react-icons/fi';
import { Navbar } from '../components/layout';
import { bookingAPI } from '../api';

const services = [
    {
        name: 'Plumbing',
        icon: '🔧',
        description: 'Leak repairs, pipe installations, and bathroom fittings by certified experts.',
        popular: true
    },
    {
        name: 'Electrical',
        icon: '⚡',
        description: 'Safe wiring, switchboard repairs, and lighting solutions around the clock.',
        popular: true
    },
    {
        name: 'Home Cleaning',
        icon: '✨',
        description: 'Deep cleaning services that leave your space spotless and refreshed.',
        popular: false
    },
    {
        name: 'Carpentry',
        icon: '🪵',
        description: 'Custom furniture repairs, shelving, and skilled woodwork craftsmanship.',
        popular: false
    },
    {
        name: 'Painting',
        icon: '🎨',
        description: 'Interior and exterior finishes with premium quality paints.',
        popular: false
    },
    {
        name: 'AC Services',
        icon: '❄️',
        description: 'Installation, maintenance, and repairs for all AC brands.',
        popular: true
    },
];

const Home = () => {
    const [platformStats, setPlatformStats] = useState({
        totalProfessionals: 0,
        completedJobs: 0,
        averageRating: 0,
        totalReviews: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await bookingAPI.getPublicStats();
                if (response.success) {
                    setPlatformStats(response.data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Format numbers for display
    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k+';
        }
        return num > 0 ? num + '+' : '0';
    };

    const stats = [
        { value: formatNumber(platformStats.totalProfessionals), label: 'Verified Professionals' },
        { value: formatNumber(platformStats.completedJobs), label: 'Completed Jobs' },
        { value: platformStats.averageRating > 0 ? platformStats.averageRating.toFixed(1) : '4.8', label: 'Average Rating', suffix: '/5' },
        { value: '30min', label: 'Avg Response Time' }
    ];

    return (
        <div className="min-h-screen bg-slate-25">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6">
                            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-subtle" />
                            <span className="text-brand-300 text-sm font-medium">
                                {platformStats.completedJobs > 0
                                    ? `${formatNumber(platformStats.completedJobs)} services completed`
                                    : 'Trusted by homeowners across Nepal'
                                }
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                            Home services,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-400">
                                simplified.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
                            Connect with verified professionals for plumbing, electrical, cleaning, and more.
                            Book in minutes, get quality service guaranteed.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register">
                                <button className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]">
                                    Book a Service
                                    <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/register?role=employee">
                                <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-sm">
                                    Join as Provider
                                </button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                                <span className="text-white font-semibold ml-2">
                                    {platformStats.averageRating > 0 ? platformStats.averageRating.toFixed(1) : '4.8'}
                                </span>
                            </div>
                            <div className="text-slate-400 text-sm">
                                Based on <span className="text-white">{formatNumber(platformStats.totalReviews)}</span> reviews
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-slate-900">
                                    {statsLoading ? (
                                        <span className="inline-block w-16 h-8 shimmer rounded" />
                                    ) : (
                                        <>
                                            {stat.value}
                                            {stat.suffix && <span className="text-slate-400 text-lg">{stat.suffix}</span>}
                                        </>
                                    )}
                                </div>
                                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 md:py-28 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-2xl mb-12 md:mb-16">
                        <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">Our Services</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
                            Everything your home needs, in one place
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            From emergency repairs to routine maintenance, we connect you with the right professional for every job.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-6 md:p-7 border border-slate-200/80 hover:border-brand-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 card-lift"
                            >
                                {service.popular && (
                                    <span className="absolute -top-2.5 right-4 px-2.5 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full">
                                        Popular
                                    </span>
                                )}
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">
                                    {service.name}
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    {service.description}
                                </p>
                                <Link
                                    to="/services"
                                    className="inline-flex items-center gap-1.5 text-brand-600 font-medium text-sm group-hover:gap-2.5 transition-all"
                                >
                                    Learn more
                                    <FiChevronRight className="text-sm" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/services">
                            <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-semibold rounded-xl transition-all">
                                View All Services
                                <FiArrowRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 md:py-28 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">How It Works</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
                            Get help in three simple steps
                        </h2>
                        <p className="text-slate-600 text-lg">
                            No complicated processes. Just quick, reliable service.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            {
                                step: '01',
                                title: 'Tell us what you need',
                                description: 'Browse services or describe your problem. We\'ll match you with the right professionals.',
                                color: 'bg-brand-50 text-brand-600'
                            },
                            {
                                step: '02',
                                title: 'Choose your time',
                                description: 'Pick a slot that works for you. Morning, afternoon, or evening — we\'re flexible.',
                                color: 'bg-amber-50 text-amber-600'
                            },
                            {
                                step: '03',
                                title: 'Get it done',
                                description: 'A verified professional arrives on time and completes the job. Pay securely after.',
                                color: 'bg-emerald-50 text-emerald-600'
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative">
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent -translate-x-1/2" />
                                )}
                                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center font-bold text-lg mb-5`}>
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 md:py-28 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">Why HomeService</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-6">
                                Service you can actually trust
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                We're not just another booking platform. We personally verify every professional
                                and stand behind every job.
                            </p>

                            <div className="space-y-5">
                                {[
                                    { icon: FiShield, title: 'Verified Professionals', desc: 'Background checks and skill verification for every provider' },
                                    { icon: FiStar, title: 'Quality Guaranteed', desc: 'Not satisfied? We\'ll make it right or refund your payment' },
                                    { icon: FiClock, title: 'On-Time, Every Time', desc: 'Real-time tracking and notifications for your peace of mind' },
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-slate-600 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Element */}
                        <div className="relative">
                            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="text-6xl mb-4">🏠</div>
                                        <p className="text-slate-600 font-medium">Your trusted home service partner</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-slate-100 max-w-[240px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <FiCheck className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">Booking Confirmed</p>
                                        <p className="text-slate-500 text-xs">Plumbing Service</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm">Ram Bahadur will arrive at 2:00 PM tomorrow</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of homeowners who trust HomeService for their home maintenance needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl transition-all hover:bg-brand-50 shadow-lg hover:shadow-xl active:scale-[0.98]">
                                Create Free Account
                                <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/register?role=employee">
                            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-xl border-2 border-brand-400 transition-all hover:bg-brand-500/80">
                                Become a Provider
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                        {/* Brand */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                                    <span className="text-white text-lg">🏠</span>
                                </div>
                                <span className="font-bold text-xl text-white">HomeService</span>
                            </div>
                            <p className="text-slate-500 leading-relaxed mb-6 max-w-sm">
                                Your trusted platform for home services. We connect homeowners with verified professionals for all their home maintenance needs.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                                    <span className="text-sm">𝕏</span>
                                </a>
                                <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                                    <span className="text-sm">f</span>
                                </a>
                                <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                                    <span className="text-sm">in</span>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Services</h4>
                            <ul className="space-y-3">
                                <li><Link to="/services" className="hover:text-white transition-colors">All Services</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Plumbing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Electrical</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cleaning</a></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
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

                    <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-sm">
                            © 2026 HomeService. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
