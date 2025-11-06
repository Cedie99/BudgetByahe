import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaMapMarkedAlt, FaClock, FaRoute, FaBuilding, FaArrowRight} from "react-icons/fa";
import './App.css';
import MapPhilippines from './MapPhilippines.js';
import peso from './assets/peso.png';
import route from './assets/route.png';
import devices from './assets/devices.png';
import fb from './assets/fb.png';
import ig from './assets/insta.png';
import gmail from './assets/gmail.png';
import aboutImage from './assets/brandlogo.png'
import Footer from './Footer.js'


function Home() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);

  const tutorialbtn = () => {
    featuresRef.current?.scrollIntoView({behavior: "smooth"});
  }

  const aboutbtn = () => {
    aboutRef.current?.scrollIntoView({behavior: "smooth"});
  }


  const [activeFAQ, setActiveFAQ] = React.useState(0);
  const answerRef = React.useRef([]);

  const toggleFAQ = (index) =>{
    setActiveFAQ(activeFAQ === index ? null : index);
  }


  return (
    <div className="home-container">
     {/* ===== Landing Section ===== */}
      <section className="landing-section" id='landing'>
        <div className="landing-centered">
          <h1 className="landing-title">
            <span>Transparent Fare:</span> Smart Fare Calculation for Tricycles & Jeepneys 
          </h1>
          <p className="landing-subtext">
            Empowering commuters with accurate, fair, and easy-to-understand 
            fare calculations for every ride.
          </p>

          <div className="landing-highlights">
            <div className="highlight-item">
              <FaBus className="highlight-icon" />
              <span>Real-time fare updates</span>
            </div>
            <div className="highlight-item">
              <FaMapMarkedAlt className="highlight-icon" />
              <span>Route optimization</span>
            </div>
            <div className="highlight-item">
              <FaClock className="highlight-icon" />
              <span>Accessible anytime</span>
            </div>
          </div>

          <button
            className="find-route-button"
            onClick={() => navigate("/mainFeature")}
          >
            Find My Route
          </button>
          <button
            className="how-button"
            onClick={tutorialbtn} 
          >
            
            See How it Works
          </button>
        </div>

        <div className="scroll-indicator-creative" onClick={aboutbtn}>
            <img src={aboutImage} alt="Scroll Down" className="scroll-compass-img" /> 
            <span className="scroll-text">SCROLL DOWN TO VIEW MORE</span>
        </div>

      </section>

      {/* ===== Data Sources & Official References ===== */}
      <section className="data-banner">
        <div className="data-track">
          <div className="data-slide">
            <span>LTFRB Fare Matrix</span>
            <span>LGU Fare Rates</span>
            <span>Regularly Updated Data</span>
            <span>Nationwide Expansion Soon</span>
          </div>
          {/* Duplicate for seamless looping */}
          <div className="data-slide">
            <span>LTFRB Fare Matrix</span>
            <span>LGU Fare Rates</span>
            <span>Regularly Updated Data</span>
            <span>Nationwide Expansion Soon</span>
          </div>
        </div>
      </section>



       {/* ===== About Budget Byahe ===== */}
      <section class="about-modern" id='abt-modern' ref={aboutRef }>
        <div class="about-container">
          <div class="about-text">
            <h2>About <span className="highlight">Budget Biyahe</span></h2>
            <p>
              Budget Biyahe is a Transparent Fare Calculation System for Tricycle and Jeepney Services, aims to revolutionize 
              local public transportation by providing commuters and drivers with a fair, accurate, and easy-to-use fare 
              calculation platform. By leveraging modern web technologies and real-time data, our system ensures transparency 
              in fare computation, reduces disputes, and promotes trust between passengers and drivers.
            </p>

              <div className="about-stats">
                <div className="stat">
                  <FaRoute className="stats-icon" />
                  <span>120+ Routes Covered</span>
                </div>
                <div className="stat">
                  <FaBuilding className="stats-icon" />
                  <span>50+ Partner LGUs</span>
                </div>
              </div>

          </div>
          <div class="about-visual">
            <div class="about-icons">
              <div class="icon-box">
                <i class="fas fa-bus"></i>
                <h4>Efficient Transport</h4>
                <p>We ensure fare transparency and accessibility for every commuter.</p>
              </div>
              <div class="icon-box">
                <i class="fas fa-handshake"></i>
                <h4>Collaboration</h4>
                <p>Coordinating with local transport authorities for consistent and reliable fare data.</p>
              </div>
              <div class="icon-box">
                <i class="fas fa-balance-scale"></i>
                <h4>Transparency</h4>
                <p>Fare rates are verified, regulated, and publicly accessible.</p>
              </div>
              <div class="icon-box">
                <i class="fas fa-balance-scale"></i>
                <h4>Innovation</h4>
                <p>Leveraging smart technology to simplify fare calculation and improve commuter experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tutorial Section ===== */}
      <section className="tutorial-section" id="tutorial" ref={featuresRef}>
        <div className="tutorial-container">
          <h2>Getting Started with <span className="highlight">Budget Biyahe</span></h2>
          <p className="tutorial-subtext">
            Follow these simple steps to explore routes, calculate fares, and stay updated
            with the latest transport rates in your area.
          </p>

          <div className="tutorial-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign up or Log In</h3>
              <p>
                Start by signing up or logging in to access commuting tools and fare data.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Select Your Route</h3>
              <p>
                Enter your origin and destination to find the most efficient route available for jeepneys or tricycles.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Check the Fare Matrix</h3>
              <p>
                Instantly view the updated fare matrix from both LTFRB and your local LGU to ensure transparency.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Plan Your Trip</h3>
              <p>
                Get fare estimates, route maps, and travel insights — so you can budget your trip before leaving.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* ===== About Us ===== */}
      <section className="about-section">
      <div className="about-content">
        <div className="about-text">
          <h2>
            Why Choose <span className="highlight">Us?</span>
          </h2>
          <p className="about-description">
            Budget Biyahe provides a transparent and reliable way to calculate
            jeepney and tricycle fares. Our system ensures you always pay fair
            and accurate fares based on updated rates.
          </p>

          <div className="about-features">
            <div className="feature">
              <div className="icon-wrapper">
                <FaBus />
              </div>
              <div>
                <h3>Seamless Fare Updates</h3>
                <p>
                  Stay informed with automatically updated fare rates for your
                  routes and destinations.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="icon-wrapper">
                <FaMapMarkedAlt />
              </div>
              <div>
                <h3>Smart Route Assistance</h3>
                <p>
                  Discover the best and most affordable route combinations with
                  real-time mapping.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="icon-wrapper">
                <FaClock />
              </div>
              <div>
                <h3>24/7 Fare Access</h3>
                <p>
                  Access fare information anytime, anywhere — whether online or
                  on-the-go.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-image">
          <img src={aboutImage} alt="Fare guide" />
        </div>
      </div>
    </section>

    {/* ===== FAQ Section ===== */}
    <section className="faq-section " >
      <div className="faq-layout">

        {/* LEFT SIDE - Title + Description */}
        <div className="faq-info">
          <h2>Frequently Asked <span className="highlight">Questions</span></h2>
          <p>Got questions about fare accuracy, data sources, or supported locations?  
          We've compiled the most common queries from commuters just like you.</p>
          <p className="subtext">Still curious? <a href="#contact">Contact us directly.</a></p>
        </div>

        {/* RIGHT SIDE - FAQ List */}
        <div className="faq-container">
          {[
            { q: "Is Budget Biyahe free to use?", a: "Yes! Our fare calculator is completely free for commuters to use." },
            { q: "Where do you get your fare data?", a: "We source our fare rates from official LTFRB and LGU-issued fare matrices." },
            { q: "Do you support all cities in the Philippines?", a: "Currently, we cover selected LGUs — but we are rapidly expanding nationwide." },
            { q: "Can I suggest corrections or report outdated fares?", a: "Absolutely! You may reach out through our contact channels for verification." }
          ].map((item, i) => (
            <div key={i} className={`faq-item ${activeFAQ === i ? "active" : ""}`}>
              <button className="faq-question" onClick={() => toggleFAQ(i)}>
                {item.q}
              </button>
              <div
                  className="faq-answer"
                  ref={(el) => (answerRef.current[i] = el)}
                  style={{
                    height: activeFAQ === i ? `${answerRef.current[i]?.scrollHeight}px` : "0px",
                    padding: activeFAQ === i ? "15px 20px" : "0 20px",
                  }}
                >
                  <p>{item.a}</p>
                </div>

            </div>
          ))}
        </div>


        </div>
    </section>



     

      {/* ===== Footer ===== */}
      <Footer/>

    </div>
  );
}

export default Home;
