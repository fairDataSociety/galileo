import {useState} from "react";
import {useSelector} from "react-redux";
import {selectUser} from "./features/user/userSlice";

export default function Login({fullLogin}) {
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formPod, setFormPod] = useState('');
    const [formKv, setFormKv] = useState('');
    const user = useSelector(selectUser);

    function isSubmitFormEnabled() {
        return formUsername && formPassword && formPod && formKv;
    }

    return (
        <div className="d-flex justify-content-center">
            <div className="col-sm-9 col-md-6">
                <h3>Login with local FairOS credentials</h3>
                <form onSubmit={async e => {
                    e.preventDefault();
                    if (await fullLogin(formUsername, formPassword, formPod, formKv)) {
                        localStorage.setItem('osm_username', formUsername);
                        localStorage.setItem('osm_password', formPassword);
                        localStorage.setItem('osm_pod', formPod);
                        localStorage.setItem('osm_kv', formKv);
                    }
                }}>
                    <fieldset
                        // disabled={user.status !== STATUS_NOT_AUTH}
                    >
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

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Pod name</label>
                            <input type="text" className="form-control"
                                   onChange={e => setFormPod(e.target.value)}
                                   value={formPod}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Pod kv (key-value
                                table)</label>
                            <input type="text" className="form-control"
                                   onChange={e => setFormKv(e.target.value)}
                                   value={formKv}/>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={!isSubmitFormEnabled()}>
                            Submit
                        </button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
