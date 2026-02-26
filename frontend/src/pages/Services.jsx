/**
 * Services Page
 * Public listing of available home services
 */

import { Link } from 'react-router-dom';
import {
    FiArrowRight,
    FiCheckCircle,
    FiClock,
    FiShield,
    FiStar,
    FiTool
} from 'react-icons/fi';
import { Navbar } from '../components/layout';

const serviceCategories = [
    {
        name: 'Plumbing',
        icon: '🔧',
        description: 'Leak repair, pipe installation, drainage fixes and bathroom fittings.',
        startingPrice: 'From Rs. 1,200'
    },
    {
        name: 'Electrical',
        icon: '⚡',
        description: 'Wiring, switchboard repair, lighting setup and safety inspections.',
        startingPrice: 'From Rs. 1,000'
    },
    {
        name: 'Home Cleaning',
        icon: '🧹',
        description: 'Deep cleaning, kitchen and bathroom sanitization, move-in cleaning.',
        startingPrice: 'From Rs. 1,500'
    },
    {
        name: 'Carpentry',
        icon: '🪚',
        description: 'Furniture assembly, repairs, shelves, and wooden fittings.',
        startingPrice: 'From Rs. 1,400'
    },
    {
        name: 'Painting',
        icon: '🎨',
        description: 'Interior and exterior painting with clean finish and protection.',
        startingPrice: 'From Rs. 3,000'
    },
    {
        name: 'AC Repair',
        icon: '❄️',
        description: 'AC maintenance, gas refill, installation and troubleshooting.',
        startingPrice: 'From Rs. 1,800'
    },
    {
        name: 'Appliance Repair',
        icon: '🛠️',
        description: 'Repair for washing machines, refrigerators, ovens and more.',
        startingPrice: 'From Rs. 1,300'
    },
    {
        name: 'Pest Control',
        icon: '🪳',
        description: 'Safe and effective pest treatments for home and office.',
        startingPrice: 'From Rs. 2,000'
    },
    {
        name: 'Gardening',
        icon: '🌿',
        description: 'Garden cleanup, trimming, plant care and landscaping support.',
        startingPrice: 'From Rs. 1,100'
    }
];

const serviceHighlights = [
    {
        icon: FiShield,
        title: 'Verified Professionals',
        text: 'Every provider goes through profile and document verification.'
    },
    {
        icon: FiClock,
        title: 'Flexible Scheduling',
        text: 'Book morning, afternoon or evening slots based on your needs.'
    },
    {
        icon: FiStar,
        title: 'Rated by Customers',
        text: 'Choose providers based on authentic reviews and ratings.'
    }
];

const Services = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <section className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                        Professional home services delivered by trusted experts across multiple categories.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {serviceHighlights.map((item) => (
                            <div key={item.title} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <item.icon className="text-blue-600 text-xl" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h2>
                                <p className="text-gray-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <FiTool className="text-blue-600 text-2xl" />
                        <h2 className="text-3xl font-bold text-gray-800">All Service Categories</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {serviceCategories.map((service) => (
                            <div
                                key={service.name}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                            >
                                <span className="text-5xl mb-4 block">{service.icon}</span>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                        {service.startingPrice}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <FiCheckCircle /> Available
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a Service Right Now?</h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Sign up and book a trusted professional in just a few steps.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                                Get Started
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all">
                                Book a Service
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

export default Services;