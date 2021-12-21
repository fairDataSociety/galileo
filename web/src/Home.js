import img1 from "./themes/reveal/img/intro-carousel/space.jpg";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectUser} from "./features/user/userSlice";
import 'jquery'
import 'popper.js'
import 'bootstrap/dist/js/bootstrap.min'

export default function Home({publicMap, privateMap}) {
    const user = useSelector(selectUser);

    const countriesUploaded = 4;
    const uploadedCountries = [
        {
            title: '🇧🇪 Belgium',
            description: 'Belgium, officially the Kingdom of Belgium, is a country in Western Europe'
        },
        {
            title: '🇨🇿 Czechia',
            description: 'The Czech Republic, also known by its short-form name Czechia and formerly known as Bohemia, is a landlocked country in Central Europe'
        },
        {
            title: '🇸🇮 Slovenia',
            description: 'Slovenia is situated in Central and Southeast Europe touching the Alps and bordering the Mediterranean Sea'
        },
        {
            title: '🇨🇭 Switzerland',
            description: 'Switzerland, officially the Swiss Confederation, is a landlocked country at the confluence of Western, Central and Southern Europe'
        },
    ];
    // There are 195 countries in the world today
    const maxCountries = 195;
    const uploadedPercent = maxCountries / 100 * countriesUploaded;

    return <div className="App">
        <h2 className="text-center mt-3">
            Uploaded <strong>
            <a data-toggle="collapse" href="#multiCollapseExample1" role="button"
               style={{textDecoration: 'underline'}}
               aria-expanded="false" aria-controls="multiCollapseExample1">
                {countriesUploaded}
            </a>
        </strong> countries of {maxCountries} 🌎
        </h2>

        <div className="d-flex justify-content-center">
            <div className="row mb-3" style={{marginLeft: 0, marginRight: 0, width: '97vw'}}>
                <div className="col">
                    <div className="collapse multi-collapse" id="multiCollapseExample1">
                        <div className="card card-body">
                            {uploadedCountries.map((item, index) => <span
                                key={index}><strong>{item.title}</strong> - {item.description}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div className="d-flex justify-content-center">
            <div className="progress " style={{
                height: 30,
                fontSize: '1rem',
                // marginLeft: 8,
                // marginRight: 8,
                width: '95vw'
            }}>
                <div className="progress-bar bg-success" role="progressbar" style={{width: `${uploadedPercent}%`}}
                     aria-valuenow={countriesUploaded}
                     aria-valuemin="0" aria-valuemax={maxCountries}>
                    {/*{countriesUploaded}%*/}
                    {/*{countriesUploaded} from {maxCountries}*/}
                    {uploadedPercent}%
                </div>
            </div>
        </div>

        <section id="intro" className="mt-4" style={{background: 'none'}}>
            <div className="intro-content" style={{background: 'none'}}>
                {/*<h2>You deserve <span><a target="_blank" href="https://fairdatasociety.org/">fair</a></span><br/>maps!*/}
                {/*</h2>*/}
                {/*<div>*/}
                {/*    <Link to="/map" className="btn-get-started scrollto">Get Started</Link>*/}
                {/*</div>*/}
                {user.indexStatus === 'ready' && <>
                    {user.isLoggedIn ? privateMap : publicMap}
                </>}
                {user.indexStatus === 'loading' && (user.isLoggedIn ?
                    <p>Loading maps info from your account...</p> :
                    <p>Loading maps info...</p>)}
            </div>

            {/*<div id="intro-carousel" className="owl-carousel">*/}
            {/*    <div className="item" style={{*/}
            {/*        backgroundImage: `url('${img1}')`*/}
            {/*    }}/>*/}
            {/*</div>*/}
        </section>
    </div>;
}
