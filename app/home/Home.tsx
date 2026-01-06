import React from 'react'
import Hero from './Hero'
import AboutSection from './AboutSection'
import Products from './Products'
import Testimonials from './Testimonials'
import Workshop from './Workshop'
import Contact from './Contact'
import Popup from './PopUp'
import ServicesSection from './ServicesSection'
import ProductVideo from './ProductVideo'

const Home = () => {
  return (
    <>
    <Hero/>
    <Popup/>
    <ProductVideo/>
    <ServicesSection/>
    <Products/>
    {/* <AboutSection/> */}
    <Testimonials/>
    {/* <Workshop/> */}
    <Contact/>
  
    </>
  )
}

export default Home