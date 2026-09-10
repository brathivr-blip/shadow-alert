import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const rain = Array.from({ length: 44 }, (_, index) => ({
  left: `${(index * 23) % 101}%`,
  delay: `${(index % 13) * 0.24}s`,
  duration: `${1.25 + (index % 7) * 0.18}s`,
  opacity: 0.16 + (index % 5) * 0.07,
}));

const particles = Array.from({ length: 24 }, (_, index) => ({
  left: `${8 + ((index * 37) % 82)}%`,
  top: `${20 + ((index * 29) % 62)}%`,
  delay: `${(index % 8) * 0.55}s`,
  duration: `${3.8 + (index % 5) * 0.7}s`,
}));

export default function LoginAtmosphere() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    const clouds = scene.querySelectorAll('.login-cloud');
    const lights = scene.querySelectorAll('.login-particle');
    const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });

    entrance.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 1.4 });
    gsap.to(clouds, {
      x: '+=90',
      duration: 24,
      repeat: -1,
      yoyo: true,
      stagger: 3,
      ease: 'sine.inOut',
    });
    gsap.to(lights, {
      y: '-=18',
      x: '+=8',
      opacity: 0.35,
      duration: 4.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.2,
      ease: 'sine.inOut',
    });

    return () => {
      entrance.kill();
      gsap.killTweensOf([clouds, lights]);
    };
  }, []);

  return (
    <div ref={sceneRef} className="login-atmosphere" aria-hidden="true">
      <div className="login-skyline login-skyline-back" />
      <div className="login-cloud login-cloud-one" />
      <div className="login-cloud login-cloud-two" />
      <div className="login-moon" />
      <div className="login-rain">
        {rain.map((drop, index) => (
          <span
            key={index}
            className="login-rain-drop"
            style={{
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>
      <div className="login-streetlight">
        <div className="login-lamp-head"><span /></div>
        <div className="login-lamp-pole" />
        <div className="login-light-beam" />
        <div className="login-road-reflection" />
      </div>
      <div className="login-particles">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="login-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
      <div className="login-fog login-fog-one" />
      <div className="login-fog login-fog-two" />
      <div className="login-road" />
      <div className="login-vignette" />
    </div>
  );
}
