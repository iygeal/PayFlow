const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PayFlow API</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #4CAF50; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Welcome to PayFlow API</h1>
        <h2>This is the backend API service developed by Iygeal Anozie.</h2>
        <p>
          📄 <a href="https://documenter.getpostman.com/view/36820009/2sB2qgeJiF" target="_blank">
            View the API Documentation
          </a>
        </p>
        <p>
          👨‍💻 <a href="https://www.linkedin.com/in/iygeal/" target="_blank">
            Connect with the Developer on LinkedIn
          </a>
        </p>
        <p>
          📂 <a href="https://github.com/iygeal/payflow" target="_blank">
            View Public GitHub Repository
          </a>
        </p>
      </body>
    </html>
  `);
});

module.exports = router;
