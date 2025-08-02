// src/components/HeroSection.js
import { useEffect, useState } from 'react';
import bg1 from './assets/jeep-bg.jpg'; // or use correct path e.g., '../assets/bg1.jpg'
import bg2 from './assets/tricycle-bg.jpg'; // or use correct path e.g., '../assets/bg2.jpg'
import './App.css'; 

const contentList = [
  {
    bg: `url(${bg1})`,
    html: `
      <p class="highlight">Fair Fares</p>
      <h1>Sulit na <span class="green">Byahe,</span> Siguradong <span>Ruta!</span></h1>
      <h3>Sa bawat lakbay, <span class="green">Budget Byahe</span> ang bahala sa iyo</h3>
      <p class='description'>
        Simulan and madaling pag biyahe ngayon! Madali mong masusuri ang tamang pamasahe at matutukoy ang pinaka-angkop
        na ruta, mapa-jeepney man o tricycle, para sa mabilis, transparent, at sulit na paglalakbay.
      </p>
      
    `
  },
  {
    bg: `url(${bg2})`,
    html: `
      <p class="highlight">Fair Fares</p>
      <h1>Smart <span class="green">Routes</span> Smarter <span>Savings</span></h1>
      <h3>Your <span class="green">journey</span> your <span>budget</span></h3>
      <p class='description'>
        Navigate with confidence! Quickly find the most affordable and efficient paths for your jeepney and tricycle journeys,
        ensuring you always get the best value and a hassle-free travel experience.
      </p>
      
    `
  }
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % contentList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { 
    const section = document.getElementById('main-section');
    const content = document.getElementById('dynamicContent');

    if (section && content) {
      content.classList.remove('fade-in');
      content.classList.add('fade-out');

      setTimeout(() => {
        section.style.backgroundImage = contentList[index].bg;
        content.innerHTML = contentList[index].html;

        content.classList.remove('fade-out');
        content.classList.add('fade-in');
      }, 500);
    }
  }, [index]);

  return (
    <main className="main-section" id="main-section">
      <div className="content-container">
        <div className="content fade-in" id="dynamicContent"></div>
      </div>
    </main>
  );
}
