import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import bbLogo from '../assets/bb-logo.png';
import jeepIcon from '../assets/greenjeep.png';
import mapIcon from '../assets/map.png';
import pesoIcon from '../assets/peso.png';

const SplashScreen = ({ onFinish }) => {
  const [currentScreen, setCurrentScreen] = useState('splash'); // splash, onboarding
  const [currentSlide, setCurrentSlide] = useState(0);

  const onboardingSlides = [
    {
      icon: mapIcon,
      title: 'Discover Routes',
      description: 'Find the best transportation routes across the Philippines with real-time information'
    },
    {
      icon: pesoIcon,
      title: 'Calculate Fares',
      description: 'Get accurate fare estimates for jeepneys, buses, tricycles, and more to budget your travel'
    },
    {
      icon: jeepIcon,
      title: 'Travel Smart',
      description: 'Make informed decisions and save money on your daily commute or trips'
    }
  ];

  useEffect(() => {
    // Show splash for 2.5 seconds, then move to onboarding
    const splashTimer = setTimeout(() => {
      setCurrentScreen('onboarding');
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (currentScreen === 'splash') {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="logo-wrapper">
            <img src={bbLogo} alt="Budget Byahe Logo" className="main-logo" />
          </div>
          <h1 className="app-name">Budget Byahe</h1>
          <p className="app-tagline">Plan Your Journey, Budget Your Ride</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Screen
  const slide = onboardingSlides[currentSlide];
  
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <div className="onboarding-illustration">
          <img src={slide.icon} alt={slide.title} />
        </div>
        
        <div className="onboarding-text">
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
        </div>

        <div className="onboarding-pagination">
          {onboardingSlides.map((_, index) => (
            <span
              key={index}
              className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
            ></span>
          ))}
        </div>

        <div className="onboarding-actions">
          <button 
            className="btn-back" 
            onClick={handleBack}
            style={{ visibility: currentSlide === 0 ? 'hidden' : 'visible' }}
          >
            Back
          </button>
          
          <button className="btn-skip" onClick={handleSkip}>
            Skip
          </button>
          
          <button className="btn-next" onClick={handleNext}>
            {currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
