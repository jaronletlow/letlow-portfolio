
import './App.css'
import SocialLink from './SocialLink'
import TextWave from './TextWave'

function App() {

  return (
    <>
		  <TextWave text="JaronLetlow" />
      <div className="social-container">
        <SocialLink social_name="Instagram" social_url="https://www.instagram.com/jaronletlow/" />
        <SocialLink social_name="Facebook" social_url="https://www.facebook.com/jaron.letlow" />
        <SocialLink social_name="Snapchat" social_url="https://snapchat.com/t/vXnug1zl" />
        <SocialLink social_name="LinkedIn" social_url="https://www.linkedin.com/in/jaron-letlow-3b60b9246/" />
        <SocialLink social_name="Email" social_url="mailto:jaron@jaronletlow.com" />
        <SocialLink social_name="GitHub" social_url="https://github.com/jaronletlow" />
      </div>
    </>
  )
}

export default App
