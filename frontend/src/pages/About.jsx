/**
 * About Page
 * Public company information page
 */

import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiHeart, FiShield, FiUsers } from 'react-icons/fi';
import { Navbar } from '../components/layout';

const values = [
    {
        icon: FiShield,
        title: 'Trust & Safety',
        text: 'We prioritize customer safety by verifying professionals before onboarding.'
    },
    {
        icon: FiHeart,
        title: 'Customer First',
        text: 'Our platform is designed to make home services simple, fast, and reliable.'
    },
    {
        icon: FiUsers,
        title: 'Community Growth',
        text: 'We help local professionals find more opportunities and grow their business.'
    }
];

const stats = [
    { label: 'Verified Professionals', value: '500+' },
    { label: 'Completed Bookings', value: '15k+' },
    { label: 'Cities Covered', value: '20+' },
    { label: 'Avg. Customer Rating', value: '4.8/5' }
];

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <section className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About HomeService</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        We connect households with trusted professionals for reliable, on-time home services.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            HomeService was built to remove the stress from finding skilled and dependable service providers.
                            We focus on transparency, quality, and accountability in every booking.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Whether you need urgent plumbing or regular home maintenance, our goal is to make booking a
                            professional as easy as ordering your daily essentials.
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">What We Promise</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-gray-700">
                                <FiCheckCircle className="text-green-600 mt-0.5" />
                                Verified professionals with customer ratings.
                            </li>
                            <li className="flex items-start gap-2 text-gray-700">
                                <FiCheckCircle className="text-green-600 mt-0.5" />
                                Transparent pricing and clear communication.
                            </li>
                            <li className="flex items-start gap-2 text-gray-700">
                                <FiCheckCircle className="text-green-600 mt-0.5" />
                                Timely service and responsive support.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {values.map((item) => (
                            <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <item.icon className="text-blue-600 text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">By The Numbers</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((item) => (
                            <div key={item.label} className="rounded-xl border border-gray-100 p-6 text-center shadow-sm">
                                <p className="text-3xl font-bold text-blue-600">{item.value}</p>
                                <p className="text-gray-600 mt-2">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the HomeService Community</h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Book trusted professionals or become a service provider and grow with us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                                Create Account
                            </button>
                        </Link>
                        <Link to="/services">
                            <button className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all">
                                Explore Services
                                <FiArrowRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-gray-300 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white text-xl font-bold mb-4">HomeService</h3>
                            <p className="text-gray-400">Your trusted platform for home services.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><span className="text-gray-400">FAQ</span></li>
                                <li><span className="text-gray-400">Terms of Service</span></li>
                                <li><span className="text-gray-400">Privacy Policy</span></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>support@homeservice.com</li>
                                <li>+977 9800000000</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2026 HomeService. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;