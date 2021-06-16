import img1 from "./themes/reveal/img/intro-carousel/space.jpg";
import {Link} from "react-router-dom";

export default function Home() {
    return <div className="App">
        <section id="intro">
            <div className="intro-content">
                <h2>You deserve <span><a target="_blank" href="https://fairdatasociety.org/">fair</a></span><br/>maps!</h2>
                <div>
                    <Link to="/map" className="btn-get-started scrollto">Get Started</Link>
                </div>
            </div>

            <div id="intro-carousel" className="owl-carousel">
                <div className="item" style={{
                    backgroundImage: `url('${img1}')`
                }}/>
            </div>
        </section>
    </div>;
}
