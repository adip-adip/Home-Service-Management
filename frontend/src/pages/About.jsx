/**
 * About Page - Premium Human-Crafted Design
 * Company story with refined aesthetics
 */

import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiHeart, FiShield, FiUsers, FiTarget, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Navbar } from '../components/layout';

const values = [
    {
        icon: FiShield,
        title: 'Trust & Safety',
        description: 'Every professional is verified through background checks and skill assessments before joining our platform.',
        color: 'bg-brand-50 text-brand-600'
    },
    {
        icon: FiHeart,
        title: 'Customer First',
        description: 'Our platform is designed around your needs — simple booking, transparent pricing, and quality guarantees.',
        color: 'bg-rose-50 text-rose-600'
    },
    {
        icon: FiUsers,
        title: 'Community Growth',
        description: 'We help local professionals find opportunities and grow their business while serving their communities.',
        color: 'bg-amber-50 text-amber-600'
    },
    {
        icon: FiTarget,
        title: 'Quality Focused',
        description: 'We maintain high standards through ratings, reviews, and continuous training for all service providers.',
        color: 'bg-emerald-50 text-emerald-600'
    }
];

const stats = [
    { value: '500+', label: 'Verified Professionals', description: 'Skilled experts across Nepal' },
    { value: '12,000+', label: 'Jobs Completed', description: 'And counting every day' },
    { value: '20+', label: 'Service Categories', description: 'For all home needs' },
    { value: '4.8/5', label: 'Average Rating', description: 'From happy customers' }
];

const team = [
    { name: 'Suraj Maharjan', role: 'Founder & CEO', initials: 'SM' },
    { name: 'Anita Shrestha', role: 'Head of Operations', initials: 'AS' },
    { name: 'Bikash Tamang', role: 'Tech Lead', initials: 'BT' },
];

const About = () => {
    return (
        <div className="min-h-screen bg-slate-25">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6">
                            <span className="text-brand-300 text-sm font-medium">Our Story</span>
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                            Making home services simple for everyone
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                            We started HomeService with a simple mission: connect homeowners with trusted professionals,
                            hassle-free. Today, we're Nepal's growing platform for home services.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">Our Mission</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-6">
                                Quality service should be accessible to everyone
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                HomeService was built to remove the stress from finding skilled and dependable service providers.
                                We focus on transparency, quality, and accountability in every interaction.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                Whether you need urgent plumbing repairs or regular home maintenance, our goal is to make
                                booking a professional as easy as a few taps on your phone.
                            </p>

                            {/* Promise List */}
                            <div className="space-y-4">
                                {[
                                    'Verified professionals with real customer ratings',
                                    'Transparent pricing with no hidden fees',
                                    'On-time service and responsive support',
                                    'Quality guarantee on every booking'
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <FiCheck className="w-3 h-3 text-emerald-600" />
                                        </div>
                                        <span className="text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-50 rounded-3xl overflow-hidden flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="text-8xl mb-6">🏡</div>
                                    <p className="text-brand-800 font-medium text-lg">
                                        Serving homes across Nepal
                                    </p>
                                </div>
                            </div>
                            {/* Floating stat card */}
                            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-slate-100">
                                <div className="text-3xl font-bold text-slate-900">12,000+</div>
                                <div className="text-slate-500 text-sm">Happy customers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">Our Values</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
                            What drives us every day
                        </h2>
                        <p className="text-slate-600 text-lg">
                            These principles guide every decision we make and every service we deliver.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-slate-300 transition-all hover:shadow-lg"
                            >
                                <div className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center mb-5`}>
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">Our Impact</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
                            The numbers speak for themselves
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="text-center p-8 rounded-2xl bg-slate-50 border border-slate-100"
                            >
                                <div className="text-4xl font-bold text-brand-600 mb-2">{stat.value}</div>
                                <div className="font-semibold text-slate-900 mb-1">{stat.label}</div>
                                <div className="text-sm text-slate-500">{stat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">Our Team</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
                            The people behind HomeService
                        </h2>
                        <p className="text-slate-600 text-lg">
                            A passionate team dedicated to transforming how Nepal experiences home services.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="text-center">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/25">
                                    {member.initials}
                                </div>
                                <h3 className="font-semibold text-slate-900">{member.name}</h3>
                                <p className="text-slate-500 text-sm">{member.role}</p>
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
                        Ready to join us?
                    </h2>
                    <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
                        Whether you need home services or want to offer your skills, we'd love to have you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl transition-all hover:bg-brand-50 shadow-lg hover:shadow-xl active:scale-[0.98]">
                                Create Account
                                <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/services">
                            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-xl border-2 border-brand-400 transition-all hover:bg-brand-500/80">
                                Explore Services
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
                                <li><Link to="/services" className="hover:text-white transition-colors">All Services</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Plumbing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Electrical</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cleaning</a></li>
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

export default About;
