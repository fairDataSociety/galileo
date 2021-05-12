import React from 'react';
import {Provider} from 'react-redux'
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {store} from './app/store';
import './index.css';
import 'tangram/dist/tangram.min';
import 'bootstrap/dist/css/bootstrap.min.css';
import './themes/reveal/css/style.css';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
