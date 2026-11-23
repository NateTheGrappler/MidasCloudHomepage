const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok", success: true });
});

app.listen(6767, () => {
    console.log(`Server running at http://localhost:6767`);
})