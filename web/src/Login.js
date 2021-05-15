import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {login, resetStatus, selectUser, tryLogin} from "./features/user/userSlice";
import {Redirect, useLocation} from "react-router-dom";

export default function Login() {
    const dispatch = useDispatch();
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const user = useSelector(selectUser);
    let location = useLocation();
    let {from} = location.state || {from: {pathname: "/"}};

    useEffect(() => {
        dispatch(resetStatus());
        dispatch(tryLogin());
    }, []);

    function isSubmitFormEnabled() {
        return formUsername && formPassword;
    }

    return (
        <div className="d-flex justify-content-center">
            {user.isLoggedIn ? <Redirect to={from}/> : ''}
            <div className="col-sm-9 col-md-6">
                <h3>Login with FairOS credentials</h3>
                <form onSubmit={ e => {
                    e.preventDefault();
                    dispatch(login({username: formUsername, password: formPassword}));
                }}>
                    <fieldset disabled={user.status === 'login' || user.isLoggedIn}>
                        {user.statusText && <div className="alert alert-danger" role="alert">
                            {user.statusText}
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

                        <button type="submit" className="btn btn-primary" disabled={!isSubmitFormEnabled()}>
                            {user.status === 'login' ? <span className="spinner-border spinner-border-sm" role="status"
                                                             aria-hidden="true"/> : ''}
                            Submit
                        </button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
