/**
 * Home Page - Tailwind CSS Version
 */

import { Link } from 'react-router-dom';
import { FiSearch, FiStar, FiShield, FiClock, FiArrowRight } from 'react-icons/fi';
import { Navbar } from '../components/layout';

const services = [
    { name: 'Plumbing', icon: '🔧', description: 'Expert plumbers for all your needs' },
    { name: 'Electrical', icon: '⚡', description: 'Licensed electricians available 24/7' },
    { name: 'Cleaning', icon: '🧹', description: 'Professional home cleaning services' },
    { name: 'Carpentry', icon: '🪚', description: 'Skilled carpenters for repairs & furniture' },
    { name: 'Painting', icon: '🎨', description: 'Interior & exterior painting experts' },
    { name: 'AC Repair', icon: '❄️', description: 'AC installation & repair services' },
];

const features = [
    { icon: FiShield, title: 'Verified Professionals', description: 'All service providers are background checked and verified' },
    { icon: FiStar, title: 'Quality Service', description: 'Top-rated professionals with excellent reviews' },
    { icon: FiClock, title: 'On-Time Service', description: 'Punctual service delivery guaranteed' },
];

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Find Trusted Home Service Professionals
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
                        Connect with verified experts for plumbing, electrical, cleaning, and more
                    </p>
                    
                    {/* Search Box */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto bg-white rounded-xl p-2 shadow-2xl">
                        <div className="flex items-center flex-1 w-full">
                            <FiSearch className="text-gray-400 ml-4 text-xl" />
                            <input 
                                type="text" 
                                placeholder="What service do you need?" 
                                className="flex-1 px-4 py-3 text-gray-700 bg-transparent outline-none text-lg"
                            />
                        </div>
                        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                            Search
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
                        <div className="text-center">
                            <div className="text-4xl font-bold">500+</div>
                            <div className="text-blue-200">Service Providers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">10k+</div>
                            <div className="text-blue-200">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">4.8</div>
                            <div className="text-blue-200">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Popular Services
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Explore our most requested home services
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
                            >
                                <span className="text-5xl mb-4 block">{service.icon}</span>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/services">
                            <button className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200">
                                View All Services
                                <FiArrowRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
                        Why Choose HomeService?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <feature.icon className="text-blue-600 text-2xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose a Service</h3>
                            <p className="text-gray-600">Browse our services and select what you need</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Book an Appointment</h3>
                            <p className="text-gray-600">Pick a convenient time slot for your service</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Get it Done</h3>
                            <p className="text-gray-600">Our professional arrives and completes the job</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of satisfied customers who trust HomeService
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-colors duration-200 text-lg">
                                Get Started Free
                            </button>
                        </Link>
                        <Link to="/register?role=employee">
                            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-all duration-200 text-lg">
                                Become a Provider
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
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
                                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>support@homeservice.com</li>
                                <li>+1 (555) 123-4567</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 HomeService. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
