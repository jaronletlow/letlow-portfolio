
import './App.css'
import SocialLink from './SocialLink'

function App() {

  return (
    <>
		  <h1>Jaron's Site</h1>
      <div className="social-container">
        <SocialLink social_name="Instagram" social_url="https://www.instagram.com/jaronletlow/" />
        <SocialLink social_name="Facebook" social_url="https://www.facebook.com/jaron.letlow" />
        <SocialLink social_name="Snapchat" social_url="https://www.google.com" />
        <SocialLink social_name="LinkedIn" social_url="https://www.linkedin.com/in/jaron-letlow-3b60b9246/" />
      </div>


    </>
  )
}

export default App
