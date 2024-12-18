const express = require('express')
const app = express()

//set up view engine
app.set("view engine", "ejs")

app.get('/', (req, res) => {
    console.log('Here')
    res.redirect('https://bookit-landing.web.app/');
})

app.listen(3000)
