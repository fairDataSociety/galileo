import {useDispatch, useSelector} from "react-redux";
import {registrationAsync, reset, selectRegistration} from "./registrationSlice";
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import {Redirect} from "react-router-dom";
import {setUser} from "../user/userSlice";

export default function Registration() {
    const component = useSelector(selectRegistration);
    const dispatch = useDispatch();

    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formMnemonic, setFormMnemonic] = useState('');

    useEffect(() => {
        dispatch(reset());
        const wallet = ethers.Wallet.createRandom();
        setFormMnemonic(wallet.mnemonic.phrase);
    }, []);

    function isSubmitFormEnabled() {
        return formUsername && formPassword && formMnemonic;
    }

    if (component.status === 'registered') {
        dispatch(setUser({isLoggedIn: true, username: formUsername, password: formPassword}));
    }

    return <div className="App-registration">
        {component.status === 'registered' && <Redirect to="/registry"/>}
        <div className="d-flex justify-content-center">
            <div className="col-sm-9 col-md-6">
                <h3>Registration in FairOS</h3>
                <form onSubmit={async e => {
                    e.preventDefault();
                    dispatch(registrationAsync({
                        username: formUsername,
                        password: formPassword,
                        mnemonic: formMnemonic
                    }));
                }}>
                    <fieldset disabled={component.status === 'loading' || component.status === 'registered'}>
                        {(component.status === 'error' && component.statusText) &&
                        <div className="alert alert-danger" role="alert">
                            {component.statusText}
                        </div>}
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Username</label>
                            <input type="text" className="form-control"
                                   onChange={e => setFormUsername(e.target.value)}
                                   value={formUsername}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input type="password" className="form-control"
                                   onChange={e => setFormPassword(e.target.value)}
                                   value={formPassword}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Mnemonic</label>
                            <input type="text" className="form-control"
                                   onChange={e => setFormMnemonic(e.target.value)}
                                   value={formMnemonic}/>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={!isSubmitFormEnabled()}>
                            Submit
                        </button>
                    </fieldset>
                </form>
            </div>
        </div>
    </div>;
}
