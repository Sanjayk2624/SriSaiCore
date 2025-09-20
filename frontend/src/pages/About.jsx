import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Sai Engineering</title>
        <meta name="description" content="Sai Engineering specializes in high-performance shell core manufacturing in Coimbatore. Discover our mission, values, and dedicated team." />
        <meta name="keywords" content="Sai Engineering, Shell Core, Coimbatore, Foundry, Manufacturing, About Us" />
        <meta property="og:title" content="About Us | Sai Engineering" />
        <meta property="og:description" content="Get to know Sai Engineering, our journey, mission, and values." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-16 text-gray-800">
        <motion.h1
          className="text-4xl font-extrabold text-center text-primary mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About Sai Engineering
        </motion.h1>

        <motion.section
          className="mb-12 text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-6">
            We are a passionate team dedicated to manufacturing high-performance Shell Core components for the
            foundry industry. Located in Coimbatore, Tamil Nadu, Sai Engineering blends precision engineering with innovation.
          </p>
          <p>
            Since our founding, we’ve grown to become a key supplier trusted by major industrial players for our
            reliability, craftsmanship, and timely delivery.
          </p>
        </motion.section>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-semibold">🚀 Our Mission</h2>
            <p>
              To deliver outstanding quality and reliability in every core we manufacture, ensuring customer satisfaction
              and continuous growth through innovation.
            </p>

            <h2 className="text-2xl font-semibold mt-6">🎯 Our Values</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Excellence in craftsmanship</li>
              <li>Commitment to clients</li>
              <li>Transparent and ethical practices</li>
              <li>Focus on sustainability and innovation</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img
              src="/assets/factory.jpg"
              alt="Factory"
              className="rounded-xl shadow-lg object-cover w-full h-[300px]"
            />
            <p className="text-sm text-center mt-2 text-gray-500">Our Facility in Coimbatore</p>
          </motion.div>
        </div>

        <motion.section
          className="mt-10 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">👥 Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <img src="/assets/team1.jpg" alt="Team Member" className="rounded-full w-24 h-24 mx-auto mb-2" />
              <h3 className="font-semibold">Mr. Ramesh Kumar</h3>
              <p className="text-sm text-gray-500">Founder & CEO</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <img src="/assets/team2.jpg" alt="Team Member" className="rounded-full w-24 h-24 mx-auto mb-2" />
              <h3 className="font-semibold">Ms. Kavya R.</h3>
              <p className="text-sm text-gray-500">Production Manager</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <img src="/assets/team3.jpg" alt="Team Member" className="rounded-full w-24 h-24 mx-auto mb-2" />
              <h3 className="font-semibold">Mr. Arun V.</h3>
              <p className="text-sm text-gray-500">Operations Head</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-8 text-center">🛤️ Our Journey</h2>
          <div className="relative border-l-4 border-primary pl-6 space-y-10">
            {[
              {
                year: "2009",
                title: "Founded",
                description: "Sai Engineering was established in Coimbatore with a vision to provide quality shell core manufacturing."
              },
              {
                year: "2014",
                title: "Expanded Production",
                description: "We expanded our workshop space and introduced new equipment to meet growing client demands."
              },
              {
                year: "2019",
                title: "ISO Certification",
                description: "Achieved ISO certification, reinforcing our commitment to quality and reliability."
              },
              {
                year: "2022",
                title: "National Client Base",
                description: "Grew to serve clients across multiple states in India, known for consistent product delivery."
              },
              {
                year: "2024",
                title: "Digital Transformation",
                description: "Launched our e-commerce platform and modernized operations to serve customers online."
              }
            ].map((event, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <div className="absolute -left-6 top-6 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                <h3 className="text-lg font-semibold text-primary">{event.year} – {event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>


        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 mt-20">📍 Our Location</h2>
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              title="Sai Engineering Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.2583186725626!2d77.05103771478742!3d11.081674892118455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85784ba4e4b4d%3A0x8c5b8c6ea06a24f9!2sSai%20Engineering!5e0!3m2!1sen!2sin!4v1682342335342!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.section>
      </div>
    </>
  );
}
