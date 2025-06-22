const express = require('express');
const cors = require('cors');
const app = express();

// Increase payload limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// ... rest of your app configuration ... 