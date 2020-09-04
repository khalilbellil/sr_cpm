const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const nodemailer = require('nodemailer');

const app = express()
//#region Database Config
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kookie&09',
    database: 'sr_test'
    // host: 'soumissionrenovation.ca',
    // user: 'khalilbellil',
    // password: 'NPVVTsDdPwf7TTzfWAQj3QNBvsZ478oxuu4M3cB2j7xLDq7HBw',
    // database: 'srv1'
})
//#endregion
connection.connect(err => {
    if(err) {
        return err;
    }
})

app.use(cors())

//#region Save_ajax
app.get('/update/one', (req, res) => {
    const{ table, uid, one, one_val } = req.query
    const UPDATE_USER_QUERY = `UPDATE ${table} SET ${one}='${one_val}' WHERE uid='${uid}'`
    connection.query(UPDATE_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Update réussi')
        }
    })
})
app.get('/update/two', (req, res) => {
    const{ table, uid, one, one_val, two, two_val } = req.query
    const UPDATE_USER_QUERY = `UPDATE ${table} SET ${one}='${one_val}',${two}='${two_val}' WHERE uid='${uid}'`
    connection.query(UPDATE_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Update réussi')
        }
    })
})
app.get('/update/three', (req, res) => {
    const{ table, uid, one, one_val, two, two_val, three, three_val } = req.query
    const UPDATE_USER_QUERY = `UPDATE ${table} SET ${one}='${one_val}',${two}='${two_val}',${three}='${three_val}' WHERE uid='${uid}'`
    connection.query(UPDATE_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Update réussi')
        }
    })
})
//#endregion

//#region client
app.get('/clients', (req, res) => {
    const SELECT_ALL_USER_QUERY = 'SELECT * FROM sr_client'
    connection.query(SELECT_ALL_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/clients/get', (req, res) => {
    const{ uid } = req.query
    const GET_BY_ID_QUERY = `SELECT * FROM sr_client WHERE uid='${uid}'`
    connection.query(GET_BY_ID_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/clients/add', (req, res) => {
    const{ firstname, lastname, email } = req.query
    const INSERT_USER_QUERY = `INSERT INTO sr_client(sn_cuid, sn_muid, firstname, lastname, email) VALUES(0, 0, '${firstname}', '${lastname}', '${email}')`
    connection.query(INSERT_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Client ajouté avec succes')
        }
    })
})
app.get('/client_phone', (req, res) => {
    const{ uid_client } = req.query
    const GET_BY_ID_QUERY = `SELECT * FROM sr_address WHERE uid_client='${uid_client} ORDER BY uid DESC LIMIT 1'`
    connection.query(GET_BY_ID_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})

//#endregion

//#region project
app.get('/projects', (req, res) => {
    const SELECT_ALL_USER_QUERY = 'SELECT * FROM sr_project'
    connection.query(SELECT_ALL_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/projects/get', (req, res) => {
    const{ uid } = req.query
    const GET_BY_ID_QUERY = `SELECT * FROM sr_project WHERE uid='${uid}'`
    connection.query(GET_BY_ID_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/projects/get_by_client', (req, res) => {
    const{ uid_client } = req.query
    const GET_BY_ID_QUERY = `SELECT * FROM sr_project WHERE uid_client='${uid_client}'`
    connection.query(GET_BY_ID_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/projects/add', (req, res) => {
    const{ description, status, uid_client, active_date } = req.query
    const INSERT_USER_QUERY = `INSERT INTO sr_project(sn_cuid, sn_muid, description, status, uid_client, active_date) VALUES(0, 0, '${description}', '${status}', '${uid_client}', '${active_date}')`
    connection.query(INSERT_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Projet ajouté avec succes')
        }
    })
})
app.get('/projects/activate', (req, res) => {
    const{ uid } = req.query
    const UPDATE_USER_QUERY = `UPDATE sr_project SET active_date=NOW(), status='active' WHERE uid='${uid}'`
    connection.query(UPDATE_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Projet activé avec succes')
        }
    })
})
app.get('/projects/cancel', (req, res) => {
    let{ uid, status, uid_cancel_reason, message, uid_client, uid_user } = req.query
    const INSERT_USER_QUERY = `INSERT INTO sr_cancel_reason_result(uid_project, uid_cancel_reason, rmessage, uid_client, uid_user) VALUES
    ('${uid}', '${uid_cancel_reason}', '${message}', '${uid_client}', '${uid_user}')`
    connection.query(INSERT_USER_QUERY, (err, result1) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            status = (status === "new")?"cancelled-before-qualification":"cancelled-after-qualification"
            const UPDATE_USER_QUERY = `UPDATE sr_project SET status='${status}' WHERE uid='${uid}'`
            connection.query(UPDATE_USER_QUERY, (err, result2) => {
                if(err) {
                    console.log(err)
                    return res.send(err)
                } else {
                    const GET_EMAILNAME_QUERY = `SELECT email_code FROM sr_cancel_reason WHERE uid='${uid_cancel_reason}'`
                    connection.query(GET_EMAILNAME_QUERY, (err, result_emailcode) => {
                        if(err) {
                            console.log(err)
                            return res.send(err)
                        } else {
                            const GET_EMAIL_QUERY = `SELECT * FROM sr_email WHERE name='${result_emailcode[0].email_code}'`
                            connection.query(GET_EMAIL_QUERY, (err, result_email) => {
                                if(err) {
                                    console.log(err)
                                    return res.send(err)
                                } else {
                                    const GET_EMAIL_QUERY = `SELECT gender, lastname, firstname, lang, email FROM sr_client WHERE uid='${uid_client}'`
                                    connection.query(GET_EMAIL_QUERY, (err, result_client) => {
                                        if(err) {
                                            console.log(err)
                                            return res.send(err)
                                        } else {
                                            var content = result_email[0].content_fr;
                                            var title = "Mr."
                                            var name = result_client[0].lastname;
                                            if (result_client[0].gender === "f"){
                                                title = "Ms."
                                            }
                                            if (name === undefined){
                                                name = result_client[0].firstname;
                                                title = ""
                                            }
                                            content = content.replace(`::titre::`, `${title}`)
                                            content = content.replace(`::nom::`, `${name}`)
                                            content = content.replace(`::uid_client::`, `${uid_client}`)
                                            var mailOptions = {
                                                from: 'clients@soumissionrenovation.ca',
                                                to: `${result_client[0].email}`,
                                                subject: `${result_email[0].subject_fr}`,
                                                html: `${content}`
                                            };
                                                
                                            transporter.sendMail(mailOptions, function(error, info){
                                                if (error) {
                                                    console.log(error);
                                                    return res.send('Erreur lors de l\'envoi du courriel !')
                                                } else {
                                                    console.log('Resultat de l\'envoie du courriel : ' + info.response);
                                                    return res.send('Envoi du courriel réussi');
                                                }
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})
app.get('/projects/get_cancel_reasons', (req, res) => {
    const GET_QUERY = `SELECT * FROM sr_cancel_reason`
    connection.query(GET_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
//#endregion

//#region client_history 
app.get('/client_history/get_by_client', (req, res) => {
    let{ uid_client, start, offset, lg } = req.query
    lg = (lg === undefined)?"fr":lg
    start = (start === undefined)?"0":lg
    offset = (offset === undefined)?"20":lg
    const GET_BY_ID_QUERY = `SELECT f.uid, f.uid_project, f.when_to_callback, f.followup_agent, f.sn_cdate, f.comments, f.msg_uid, fm.message_${lg} as msg,f.uid_call,f.callee,f.startTime,f.endcall_status,f.duration,f.callRecording FROM sr_followup f INNER JOIN sr_followup_msg fm ON fm.uid = f.msg_uid WHERE uid_client = '${uid_client}' ORDER BY f.uid DESC LIMIT ${start}, ${offset}`
    connection.query(GET_BY_ID_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/client_history/add', (req, res) => {
    const{ uid_msg, uid_client, uid_project, username, comments } = req.query
    const INSERT_USER_QUERY = `INSERT INTO sr_followup(sn_cdate, msg_uid, uid_client, uid_project, followup_agent, comments) VALUES(NOW(), '${uid_msg}', '${uid_client}', '${uid_project}', '${username}', '${comments}')`
    connection.query(INSERT_USER_QUERY, (err, result) => {
        if(err) {
            console.log(err);
            return res.send(err)
        } else {
            return res.send('Historique ajouté avec succes')
        }
    })
})
//#endregion

//#region others
app.get('/services', (req, res) => {
    const SELECT_ALL_QUERY = 'SELECT * FROM sr_service WHERE active="yes"'
    connection.query(SELECT_ALL_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/subservices', (req, res) => {
    const{ uid_service } = req.query
    const SELECT_QUERY = `SELECT * FROM sr_subservice WHERE active='yes' AND uid_service='${uid_service}'`
    connection.query(SELECT_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/subservices/get', (req, res) => {
    const{ uid } = req.query
    const SELECT_QUERY = `SELECT * FROM sr_subservice WHERE uid='${uid}'`
    connection.query(SELECT_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/address', (req, res) => {
    const{ uid } = req.query
    const SELECT_ALL_QUERY = `SELECT * FROM sr_address WHERE uid='${uid}'`
    connection.query(SELECT_ALL_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/service_questions', (req, res) => {
    const{ uid_service } = req.query
    const SELECT_ALL_QUERY = `SELECT * FROM sr_service_question WHERE uid_service=${uid_service} AND active="yes"`
    connection.query(SELECT_ALL_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/callbacklater/add', (req, res) => {
    const{ uid_project, uid_client, call_back_date, followup_agent, comments } = req.query
    const INSERT_CALLBACKLATER_QUERY = `INSERT INTO sr_call_back_later(uid_project, uid_client, call_back_date, followup_agent, comments) VALUES('${uid_project}', '${uid_client}', '${call_back_date}', '${followup_agent}', '${comments}')`
    connection.query(INSERT_CALLBACKLATER_QUERY, (err, result) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            return res.send("INSERT SUCCESS")
        }
    })
})
app.get('/callbacklater/get', (req, res) => {
    const{ uid_project } = req.query
    const GET_QUERY = `SELECT * FROM sr_call_back_later WHERE uid_project='${uid_project} LIMIT 1'`
    connection.query(GET_QUERY, (err, result) => {
        if(err) {
            console.log("err: "+err)
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/callbacklater/update', (req, res) => {
    const{ uid_project, uid_client, call_back_date, followup_agent, comments } = req.query
    const UPDATE_QUERY = `UPDATE sr_call_back_later SET uid_client='${uid_client}', call_back_date='${call_back_date}', followup_agent='${followup_agent}', comments='${comments}', done='no' WHERE uid_project='${uid_project}'`
    connection.query(UPDATE_QUERY, (err, result) => {
        if(err) {
            console.log("err: "+err)
            return res.send(err)
        } else {
            return res.send("UPDATE SUCCESS")
        }
    })
})
app.get('/flagforreview/update', (req, res) => {
    const{ uid_project, followup_agent } = req.query
    const UPDATE_QUERY = `UPDATE sr_project SET flaged_for_review_by='${followup_agent}', flag_for_review=1 WHERE uid='${uid_project}'`
    connection.query(UPDATE_QUERY, (err, result) => {
        if(err) {
            console.log("err: "+err)
            return res.send(err)
        } else {
            return res.send("UPDATE SUCCESS")
        }
    })
})
app.get('/flagforreview/get', (req, res) => {
    const{ uid_project } = req.query
    const UPDATE_QUERY = `SELECT flag_for_review FROM sr_project WHERE uid='${uid_project}'`
    connection.query(UPDATE_QUERY, (err, result) => {
        if(err) {
            console.log("err: "+err)
            return res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})
//#endregion

//#region NODEMAILER
let transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com', // <= your smtp server here
    port: 2525, // <= connection port
    // secure: true, // use SSL or not
    auth: {
       user: 'soumissionrenovation.ca', // <= smtp login user
       pass: 'AVxHxsYk7xhw' // <= smtp login pass
    }
 });

app.get('/nodemailer/send', (req, res) => {
    const{ name, email, lg } = req.query
    const UPDATE_USER_QUERY = `SELECT subject_${lg} as subject, content_${lg} as content FROM sr_email WHERE name='${name}' AND active='yes'`
    connection.query(UPDATE_USER_QUERY, (err, result) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            var mailOptions = {
                from: 'clients@soumissionrenovation.ca',
                to: `${email}`,
                subject: `${result[0].subject}`,
                html: `${result[0].content}`
            };
                  
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                    return res.send('Erreur lors de l\'envoi du courriel !')
                } else {
                    console.log('Resultat de l\'envoie du courriel : ' + info.response);
                    return res.send('Envoi du courriel réussi');
                }
            });
        }
    })
})
app.get('/nodemailer/sendquestions', (req, res) => {
    const{ uid_questions, uid_service, message, uid_client, name } = req.query
    const GET_EMAIL_QUERY = `SELECT gender, lastname, firstname, lang, email FROM sr_client WHERE uid='${uid_client}'`
    connection.query(GET_EMAIL_QUERY, (err, result_client) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            const SELECT_QUESTION_QUERY = `SELECT question_${result_client[0].lang} as question FROM sr_service_question WHERE uid IN(${uid_questions}) AND active='yes'`
            connection.query(SELECT_QUESTION_QUERY, (err, result) => {
                if(err) {
                    console.log(err)
                    return res.send(err)
                } else {
                    const SELECT_SERVICE_QUERY = `SELECT name_${result_client[0].lang} as name FROM sr_service WHERE uid='${uid_service}'`
                    connection.query(SELECT_SERVICE_QUERY, (err, result3) => {
                        if(err) {
                            console.log(err)
                            return res.send(err)
                        } else {
                            const SELECT_EMAIL_QUERY = `SELECT subject_${result_client[0].lang} as subject, content_${result_client[0].lang} as content FROM sr_email WHERE name='${name}' AND active='yes'`
                            connection.query(SELECT_EMAIL_QUERY, (err, result2) => {
                                if(err) {
                                    console.log(err)
                                    return res.send(err)
                                } else {
                                    var content = result2[0].content;
                                    var questions = "";
                                    result.forEach(element => {
                                        questions += `<li>${element.question}</li>`
                                    });
                                    content = content.replace(`::questions::`, `<ul>${questions}<li>${message}</li></ul>`)
                                    content = content.replace(`::service::`, `<b>${result3[0].name}</b>`)
                                    var mailOptions = {
                                        from: 'clients@soumissionrenovation.ca',
                                        to: `${result_client[0].email}`,
                                        subject: `${result2[0].subject}`,
                                        html: `${content}`
                                    };
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                            return res.send('Erreur lors de l\'envoi du courriel !')
                                        } else {
                                            console.log('Resultat de l\'envoie du courriel : ' + info.response);
                                            return res.send('Envoi du courriel réussi');
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})
//#endregion

app.listen(4000, () => {
    console.log('Le serveur roule sur le port 4000')
})