import React from 'react';
import Link from 'next/link'; // Using Next.js Link component

const Footer = () => {
    const handleClick = () => {
        window.scrollTo(0, 0); // Scrolls to top
    };

    return (
        <footer className="footer-style">
            <span style={{ color: 'white' }}>© 2023 </span>
            <span style={{ marginRight: '1em' }}></span>
            <span style={{ color: 'white' }}>{'\u2022'}</span>
            <span style={{ marginRight: '1em' }}></span>
            <Link href="/terms">
                <a onClick={handleClick} style={{ color: 'white' }}>terms</a>
            </Link>
        </footer>
    );
}

export default Footer;
