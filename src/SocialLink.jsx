import PropTypes from 'prop-types';
import { FaInstagram, FaFacebook, FaSnapchatGhost, FaLinkedin, FaEnvelope, FaGithub } from 'react-icons/fa';

function SocialLink(props){

    const social = props.social_name;
    const url = props.social_url;

    const go_to_url = (link) => window.open(link);

    const getSocialIcon = (name) => {
        switch(name.toLowerCase()) {
            case 'instagram': return <FaInstagram />;
            case 'facebook': return <FaFacebook />;
            case 'snapchat': return <FaSnapchatGhost />;
            case 'linkedin': return <FaLinkedin />;
            case 'email': return <FaEnvelope />;
            case 'github': return <FaGithub />;
            default: return null;
        }
    };

    return (
        <button onClick={() => go_to_url(url)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getSocialIcon(social)}
            <span style={{ marginLeft: '8px' }}>{social}</span>
        </button>
    );
}

export default SocialLink;

SocialLink.propTypes = {
    social_name: PropTypes.string.isRequired,
    social_url: PropTypes.string.isRequired
}