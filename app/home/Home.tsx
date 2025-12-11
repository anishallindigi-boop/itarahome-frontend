import React from 'react'
import Hero from './Hero'
import AboutSection from './AboutSection'
import Products from './Products'
import Testimonials from './Testimonials'
import Workshop from './Workshop'
import Contact from './Contact'
import Popup from './PopUp'

const Home = () => {
  return (
    <>
    <Hero/>
    <Popup/>
    <AboutSection/>
    <Products/>
    <Testimonials/>
    <Workshop/>
    <Contact/>
  
    </>
  )
}

export default Home