import {Link, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectUser} from "./features/user/userSlice";

export default function Header({onLogout}) {
    const user = useSelector(selectUser);
    const location = useLocation();
    const path = location.pathname;

    return <>
        {/*<button type="button" id="mobile-nav-toggle"><i className="fa fa-bars"/></button>*/}
        <header id="header">
            <div className="container">
                <div id="logo" className="float-left">
                    <h1><Link to="/" className="scrollto">Galileo</Link></h1>
                </div>

                <nav id="nav-menu-container">
                    <ul className="nav-menu">
                        <li className={path === '/' ? 'menu-active' : ''}>
                            <Link to="/">Home</Link>
                        </li>

                        {user.isLoggedIn && <li className={path === '/catalog' ? 'menu-active' : ''}>
                            <Link to="/catalog">Maps catalog</Link>
                        </li>}

                        {user.isLoggedIn && <li className={path === '/registry' ? 'menu-active' : ''}>
                            <Link to="/registry">Registries</Link>
                        </li>}

                        <li className={path === '/about' ? 'menu-active' : ''}>
                            <Link to="/about">About</Link>
                        </li>

                        {!user.isLoggedIn &&
                        <li className={path === '/login' ? 'menu-active' : ''}>
                            <Link to="/login">Login</Link>
                        </li>}

                        {/*{!user.isLoggedIn &&*/}
                        {/*<li className={path === '/registration' ? 'menu-active' : ''}>*/}
                        {/*    <Link to="/registration">Registration</Link>*/}
                        {/*</li>}*/}

                        {/*{user.isLoggedIn &&*/}
                        {/*<li className={path === '/map' ? 'menu-active' : ''}>*/}
                        {/*    <Link to="/map">Map</Link>*/}
                        {/*</li>}*/}

                        {user.isLoggedIn && <li className=""><a href="#" onClick={e => {
                            e.preventDefault();

                            if (window.confirm('Really logout?')) {
                                if (onLogout) {
                                    onLogout();
                                }
                            }
                        }}>Logout ({user.username})</a></li>}
                    </ul>
                </nav>
            </div>
        </header>
    </>;
}
