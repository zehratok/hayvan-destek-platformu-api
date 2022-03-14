const req = require('express/lib/request');
const { app, connection } = require('./init')
const jwt = require('jsonwebtoken')
const middleware = require('./middleware')

app.get('/kullanicilar', (req, res) => {
    connection.query('SELECT * from kullanici', (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/barinaklar/:sehir', (req, res) => {
    console.log(req.params.sehir)
    connection.query("SELECT * FROM barinak WHERE il=" + "'" + req.params.sehir + "'", (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/onecikanbarinaklar', (req, res) => {
    connection.query(`select b.* from barinak_ilanlari bi join barinak b on b.barinak_no  = bi.barinak_no group by b.barinak_adi order by count(*) desc limit 3`, (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/barinaklar', (req, res) => {
    connection.query("SELECT * FROM barinak", (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/gonderiler', (req, res) => {
    connection.query("SELECT * FROM kullanici_gonderi", (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/gonderiler/72', (req, res) => {
    connection.query("SELECT * FROM kullanici_gonderi WHERE kullanici_id=72", (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/barinak-ilanlari/:barinak_no', (req, res) => {
    console.log(req.params.barinak_no);
    connection.query("SELECT * FROM barinak_ilanlari where barinak_no=" + "'" + req.params.barinak_no + "'", (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.get('/barinak-ilanlari/ilan-detay/:ilan_no', (req, res) => {
    console.log(req.params.ilan_no);
    connection.query("SELECT * FROM barinak_ilanlari where ilan_no=" + "'" + req.params.ilan_no + "'", (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    })
})

app.post('/kayitol', (req, res) => {
    const { kullanici_adi, parola, email, kullanici_tipi } = req.body;

    connection.query(
        `INSERT INTO kullanici (kullanici_adi, email, parola, kullanici_tipi) VALUES ('${kullanici_adi}', '${email}', '${parola}', '${kullanici_tipi}');`
        , (error, results, fields) => {
            if (results == undefined) {
                res.send({
                    "mesaj": "Çift kayıt hatası"
                })

            } else {
                let result = {};
                result = {
                    "mesaj": "Kayit işlemi başarılı",
                    ...req.body
                }
                res.send(result);
            }


        })
})
app.get('/test', middleware, (req, res) => {
    console.log(req.user);
    res.send('test')
})

app.post('/giris-yap', (req, res) => {
    const { kullanici_adi, parola } = req.body;
    try {
        connection.query(
            `SELECT * FROM kullanici where kullanici_adi='${kullanici_adi}' and parola='${parola}' `
            , (error, results, fields) => {
                console.log(error)
                console.log(results)
                if (error) {
                    console.log(error)
                } else {
                    if(results.length > 0){
                        const user = {
                            "id": results[0].id,
                            "kullanici_adi": results[0].kullanici_adi,
                            "email": results[0].email,
                            "kullanici_tipi": results[0].kullanici_tipi,
    
                        }
                        const access_token = jwt.sign(user, "alaska", { expiresIn: '200d' })
                        res.send({ access_token, ...user });
                    }else{
                        res.send("Hatalı giriş")
                    }
                }
            })

    } catch (hata) {
        res.send(hata);
    }

})

app.listen(8080, () => {
    console.log("Running on 8080")
})