import PropTypes from 'prop-types';


function SocialLink(props){

    const social = props.social_name;
    const url = props.social_url;

    const go_to_url = (link) => window.open(link);

    return (
        <button onClick={() => go_to_url(url)}>{social}</button>
    )
}

export default SocialLink;

SocialLink.propTypes = {
    social_name: PropTypes.string.isRequired,
    social_url: PropTypes.string.isRequired
}