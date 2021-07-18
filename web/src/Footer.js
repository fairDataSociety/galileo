import {Link} from "react-router-dom";

export default function Footer() {
    return <footer id="footer">
        <div className="container">
            <div className="copyright">
                From <a href="https://fairdatasociety.org/">Fair Data Society</a> with ❤️<br/>
                <a href="https://github.com/fairDataSociety/Galileo">Github & Docs</a> | <Link to="/terms">Terms of Usage</Link>
            </div>
        </div>
    </footer>;
}
