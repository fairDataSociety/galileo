import express from "express";
import morgan from "morgan";
import {createProxyMiddleware} from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 3333;
const HOST = "localhost";
const API_DEBUG_URL = "http://localhost:1635";
const API_MAIN_URL = "http://localhost:1633";
// const API_DEBUG_URL = "https://ya.ru";
// const API_MAIN_URL = "https://testeron.pro";

// Logging
app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
    res.send('This is a proxy service');
});

app.use('/stamps', createProxyMiddleware({
    target: API_DEBUG_URL,
    changeOrigin: true,
}));

app.use('**', createProxyMiddleware({
    target: API_MAIN_URL,
    changeOrigin: true,
}));

app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
