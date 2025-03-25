import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-8">
            About <span className="text-indigo-600">Thryve</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Empowering mental wellness through AI-driven insights and personalized support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              At Thryve, we believe everyone deserves access to quality mental health support. Our
              AI-powered platform combines cutting-edge technology with evidence-based practices to
              provide personalized mental wellness guidance and support.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Our Approach</h2>
            <p className="text-gray-600 leading-relaxed">
              We use advanced AI algorithms to analyze your mood patterns, activities, and
              behaviors, providing personalized insights and recommendations to help you maintain
              and improve your mental well-being.
            </p>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have transformed their mental wellness with Thryve.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-colors duration-300"
          >
            Get Started Today
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">10k+</div>
            <div className="text-gray-500">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
            <div className="text-gray-500">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
            <div className="text-gray-500">AI Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
