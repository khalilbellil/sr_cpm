const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const mysql = require('mysql')
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const nodeGeocoder = require('node-geocoder');

const options = {
	provider: 'openstreetmap'
}
const geocoder = nodeGeocoder(options)

const app = express()

//#region Database config
var connection = mysql.createPool({
    connectionLimit: 10,
    // host: 'localhost',
    // user: 'root',
    // password: 'Kookie&09',
    // database: 'sr_test'
    host: 'soumissionrenovation.ca',
    user: 'khalilbellil',
    password: 'NPVVTsDdPwf7TTzfWAQj3QNBvsZ478oxuu4M3cB2j7xLDq7HBw',
    database: 'srv5'
})
//#endregion
connection.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})
module.exports = connection

// enable files upload
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 2 * 1024 * 1024 * 1024 //2MB max file(s) size
    }
}))
// make all files of directory "uploads" publicly accessible from root url
app.use(express.static('uploads'));

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'))

//#region Toolbox
function stringReturnIfNull(string, result_if_null){
    if(string === null){
        string = result_if_null
    }
    return string
}
//#endregion

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
            return res.json({
                data: result
            })
        } else {
            return res.json({
                data: result
            })
        }
    })
})
app.get('/clients/get_next_client', (req, res) => {
    const{ username, origin, lg } = req.query
    if (lg === "fr"){
        var lang = "AND c.lang = 'fr'"
    }else if (lg === "en"){
        var lang = "AND c.lang = 'en'"
    }else{
        var lang = ""
    }
    const GET_QUERY = `SELECT c.uid, (SELECT isLocked FROM sr_cs_register WHERE uid_client = c.uid LIMIT 1) as locked,
    (SELECT uid_agent FROM sr_cs_register WHERE uid_client = c.uid LIMIT 1) as locked_by
     FROM sr_client c INNER JOIN sr_project p ON p.uid_client = c.uid LEFT JOIN sr_address a ON a.uid_client = c.uid 
    LEFT JOIN sr_call_back_later cb ON cb.uid_project = p.uid AND cb.done = 'no' WHERE (p.status = 'new' OR (p.status = 'free' AND p.sn_cdate > curdate() - INTERVAL 10 DAY)) 
    AND p.flag_for_review IS NULL AND (cb.uid is null OR ((cb.done IS NULL OR cb.done = 'no') AND cb.call_back_date IS NOT NULL AND cb.call_back_date <= NOW() + interval 5 minute)) ${lang} `
    const QUERY_0 = `AND (NOT EXISTS(SELECT * from sr_followup WHERE msg_uid IN(1,11,6,4,3,5) AND uid_project = p.uid) OR c.request_state = 'partial')
    AND EXISTS(SELECT * FROM sr_project WHERE status = 'new' AND uid_client = p.uid_client)
    AND (skipped_by <> '${username}' OR skipped_by is null OR skipped_by = '')
    HAVING locked = 'yes' AND locked_by = '${username}' ORDER BY p.status = 'new' DESC, p.sn_cdate ASC LIMIT 1`
    const QUERY_FINAL0 = GET_QUERY + QUERY_0
    connection.query(QUERY_FINAL0, (err, result) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            if (result[0] !== undefined){
                return res.json({
                    data: result
                })
            }else{
                const QUERY_FINAL1 = `SELECT c.uid, p.uid as uid_project, (SELECT isLocked FROM sr_cs_register WHERE uid_client = c.uid AND uid_agent != '${username}' LIMIT 1) as locked,
                (SELECT uid_agent FROM sr_cs_register WHERE uid_client = c.uid LIMIT 1) as locked_by FROM sr_client c 
                INNER JOIN sr_project p ON p.uid_client = c.uid 
                LEFT JOIN sr_address a ON a.uid_client = c.uid 
                INNER JOIN sr_call_back_later cb ON cb.uid_project = p.uid 
                WHERE (p.status = 'new' OR (p.status = 'free' AND p.sn_cdate > curdate() - INTERVAL 10 DAY)) 
                AND p.flag_for_review IS NULL 
                AND cb.done IS NULL OR cb.done = 'no' 
                AND cb.call_back_date IS NOT NULL 
                AND cb.call_back_date - INTERVAL 5 MINUTE <= NOW() 
                AND EXISTS(SELECT * FROM sr_project WHERE status = 'new' AND uid_client = p.uid_client) 
                HAVING (locked='' OR ISNULL(locked))  
                ORDER BY p.status = 'new' DESC, p.sn_cdate ASC, p.call_back_later ASC LIMIT 100`
                connection.query(QUERY_FINAL1, (err, result) => {
                    if(err) {
                        console.log(err)
                        return res.send(err)
                    } else {
                        if (result[0] !== undefined){
                            const UPDATE_CALL_BACK = `UPDATE sr_call_back_later SET done = 'yes' WHERE uid_project = '${result[0].uid_project}'`
                            connection.query(UPDATE_CALL_BACK, (err, result_update) => {
                                if(err) {
                                    console.log(err)
                                    return res.send(err)
                                } else {
                                    console.log("call back done")
                                    return res.json({
                                        data: result
                                    })
                                }
                            })
                        }else{
                            const QUERY_2 = `AND (
                                (p.sn_cdate > (NOW() - INTERVAL 20 MINUTE) AND p.sn_cdate < (NOW() - INTERVAL 7 MINUTE) AND hour(now()) < 15)
                                OR
                                (p.adwords_campaign = 'phaseone')
                                )
                            AND (NOT EXISTS(SELECT * from sr_followup WHERE msg_uid IN(1,11,6,4,5) AND uid_project = p.uid) OR c.request_state = 'partial')
                            AND (skipped_by <> '${username}' OR skipped_by is null OR skipped_by = '')
                            HAVING (locked='' OR ISNULL(locked)) 
                            ORDER BY p.status = 'new' DESC, p.sn_cdate ASC LIMIT 100`
                            const QUERY_FINAL2 = GET_QUERY + QUERY_2
                            connection.query(QUERY_FINAL2, (err, result) => {
                                if(err) {
                                    console.log(err)
                                    return res.send(err)
                                } else {
                                    if (result[0] !== undefined){
                                        return res.json({
                                            data: result
                                        })
                                    }else{
                                        const QUERY_3 = `AND p.sn_cdate < NOW() - INTERVAL 6 HOUR
                                        AND (NOT EXISTS(SELECT * from sr_followup WHERE msg_uid IN(1,11,6,4,5) AND uid_project = p.uid) OR c.request_state = 'partial')
                                        AND (skipped_by <> '${username}' OR skipped_by is null OR skipped_by = '')
                                        HAVING (locked='' OR ISNULL(locked))  
                                        ORDER BY p.status = 'new' DESC, DATE(p.sn_cdate) ASC, p.treatment_priority DESC LIMIT 100`
                                        const QUERY_FINAL3 = GET_QUERY + QUERY_3
                                        connection.query(QUERY_FINAL3, (err, result) => {
                                            if(err) {
                                                console.log(err)
                                                return res.send(err)
                                            } else {
                                                if (result[0] !== undefined){
                                                    return res.json({
                                                        data: result
                                                    })
                                                }else{
                                                    const QUERY_4 = `AND p.sn_cdate < (NOW() - INTERVAL 5 MINUTE)
                                                    AND (NOT EXISTS(SELECT * from sr_followup WHERE msg_uid IN(1,11,6,4,5,3) AND uid_project = p.uid) OR c.request_state = 'partial')
                                                    AND (skipped_by <> '${username}' OR skipped_by is null OR skipped_by = '')
                                                    HAVING (locked='' OR ISNULL(locked)) 
                                                    ORDER BY p.status = 'new' DESC, p.sn_cdate ASC LIMIT 100`
                                                    const QUERY_FINAL4 = GET_QUERY + QUERY_4
                                                    connection.query(QUERY_FINAL4, (err, result) => {
                                                        if(err) {
                                                            console.log(err)
                                                            return res.send(err)
                                                        } else {
                                                            if (result[0] !== undefined){
                                                                return res.json({
                                                                    data: result
                                                                })
                                                            }else{
                                                                return res.json({
                                                                    data: {found: "no"}
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
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
app.get('/client/get_projects', (req, res) => {
    const{ uid_client } = req.query
    const GET_QUERY = `SELECT uid FROM sr_project WHERE uid_client='${uid_client}' ORDER BY uid DESC`
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

//#region project
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
app.get('/projects/new', (req, res) => {
    const{ uid_client } = req.query
    const INSERT_USER_QUERY = `INSERT INTO sr_project(sn_cdate, sn_mdate, status, uid_client, sn_custom) VALUES(NOW(), NOW(), 'new', '${uid_client}', 0)`
    connection.query(INSERT_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Projet ajouté avec succes')
        }
    })
})
app.get('/projects/duplicate', (req, res) => {
    const{ uid } = req.query
    const GET = `SELECT * FROM sr_project WHERE uid='${uid}'`
    connection.query(GET, (err, result1) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            const INSERT = `INSERT INTO sr_project(sn_cdate, sn_mdate, status, uid_client, sn_custom,uid_address,description,due_date,has_file,uid_service,uid_secondary_service,lead_price,estimated_value,additional_info, 
                uid_project_type,comments,best_contact_way,project_type,delay_from,delay_to,delay_options,shared_budget,employee,quality) VALUES(NOW(), NOW(), 'new', '${result1[0].uid_client}',0,${result1[0].uid_address},
                '${stringReturnIfNull(result1[0].description, '')}', '${stringReturnIfNull(result1[0].due_date, '')}', ${result1[0].has_file}, ${result1[0].uid_service}, ${result1[0].uid_secondary_service}, ${result1[0].lead_price},
                ${result1[0].estimated_value}, '${stringReturnIfNull(result1[0].additional_info, '')}', ${result1[0].uid_project_type}, '${stringReturnIfNull(result1[0].comments, "")}','${stringReturnIfNull(result1[0].best_contact_way,"")}','${stringReturnIfNull(result1[0].project_type,"")}',
                '${format(new Date(result1[0].delay_from), 'yyyy-MM-dd')}','${format(new Date(result1[0].delay_to), 'yyyy-MM-dd')}',${result1[0].delay_options},'${stringReturnIfNull(result1[0].shared_budget,"")}','${stringReturnIfNull(result1[0].employee, 'no')}','${stringReturnIfNull(result1[0].quality, "standard")}')`
            connection.query(INSERT, (err, result2) => {
                if(err) {
                    console.log(err)
                    return res.send(err)
                } else {
                    return res.send('Projet ajouté avec succes')
                }
            })
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
    ('${uid}', '${(uid_cancel_reason !== "0")?uid_cancel_reason:""}', '${message}', '${uid_client}', '${uid_user}')`
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
                    if (uid_cancel_reason.trim() !== "0"){
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
                    else{
                        return res.send("success")
                    }
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

//#region client_lock
app.get('/clients/lock', (req, res) => {
    const{ uid_client, origin, username } = req.query
    const GET_QUERY = `SELECT * FROM sr_cs_register WHERE uid_client = '${uid_client}'`
    connection.query(GET_QUERY, (err, result1) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            if (result1[0] === undefined){
                const INSERT_USER_QUERY = `INSERT INTO sr_cs_register(uid_client, origin, uid_agent, status, isLocked) VALUES('${uid_client}', '${origin}', '${username}', 'locked', 'yes')`
                connection.query(INSERT_USER_QUERY, (err, result) => {
                    if(err) {
                        console.log(err)
                        return res.json({
                            data: {already_locked: "no"}
                        })
                    } else {
                        return res.json({
                            data: {already_locked: "no"}
                        })
                    }
                })
            }else{
                if (result1[0].uid_agent !== username){
                    return res.json({
                        data: {already_locked: "yes"}
                    })
                }else{
                    return res.json({
                        data: {already_locked: "no"}
                    })
                }
            }
        }
    })
})
app.get('/clients/unlock', (req, res) => {
    const{ origin, username } = req.query
    const INSERT_USER_QUERY = `DELETE FROM sr_cs_register WHERE uid_agent = '${username}' AND origin = '${origin}'`
    connection.query(INSERT_USER_QUERY, (err, result) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            return res.send('succes')
        }
    })
})
//#endregion

//#region search_client
app.get('/clients/get_by_phone', (req, res) => {
    var { phone } = req.query
    const GET_BY_ID_QUERY = `SELECT uid_client FROM sr_address WHERE phone1='${phone}' OR phone2='${phone}' ORDER BY uid DESC LIMIT 1`
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
app.get('/clients/get_by_project', (req, res) => {
    var { uid_project } = req.query
    const GET_BY_ID_QUERY = `SELECT uid_client FROM sr_project WHERE uid='${uid_project}'`
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
app.get('/address/add', (req, res) => {
    const{ one, one_val, uid_client } = req.query
    const ADD_QUERY = `INSERT INTO sr_address(sn_cdate, sn_mdate, ${one}, uid_client) VALUES(NOW(), NOW(), '${one_val}', '${uid_client}')`
    connection.query(ADD_QUERY, (err, result) => {
        if(err) {
            console.log(err)
			return res.send(err)
        } else {
            console.log(result.insertId)
            return res.json({
                data: {uid_address: result.insertId}
            })
        }
    })
})
app.get('/address/save', (req, res) => {
	const{ uid_client, street_no, street, city, province, country, phone1, phone2 } = req.query
	const ADD_QUERY = `INSERT INTO sr_address(sn_cdate, sn_mdate, uid_client, street_no, street, city, province, country, phone1, phone2) VALUES(NOW(), NOW(), '${uid_client}', '${street_no}', '${street}', '${city}', '${province}', '${country}', '${phone1}', '${phone2}')`
	connection.query(ADD_QUERY, (err, result) => {
	if(err) {
		console.log(err)
		return res.send(err)
	} else {
		console.log("insertId: "+result.insertId)
		return res.json({
			data: {uid_address: result.insertId}
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
app.get('/city', (req, res) => {
	const QUERY = `SELECT uid, uid_territory, name_fr, name_en FROM sr_city WHERE active='yes' ORDER BY name_fr ASC`
	connection.query(QUERY, (err, result) => {
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
app.get('/city/get', (req, res) => {
	const{ name } = req.query
	const QUERY = `SELECT uid, uid_territory, name_fr, name_en FROM sr_city WHERE active='yes' AND name_en='${name}'`
	connection.query(QUERY, (err, result) => {
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
app.get('/get_zipcode', (req, res) => {
	const{ address } = req.query
	geocoder.geocode(address)
	.then((result)=> {
		return res.json({
			data: result
		})
	})
	.catch((err)=> {
		console.log("err: "+err)
		return res.send(err)
	})
})
app.get('/client_info/nb_project', (req, res) => {
	const{ uid_client } = req.query
	const QUERY = `SELECT count(uid) as nb_project FROM sr_project WHERE uid_client='${uid_client}'`
	connection.query(QUERY, (err, result1) => {
		if(err) {
			console.log("err: "+err)
			return res.send(err)
		} else {
			const QUERY2 = `SELECT count(uid) as nb_activated_project FROM sr_project WHERE uid_client='${uid_client}' AND status NOT IN('cancelled-before-qualification','cancelled-after-qualification','new')`
            connection.query(QUERY2, (err, result2) => {
                if(err) {
                    console.log("err: "+err)
                    return res.send(err)
                } else {
                    const QUERY3 = `SELECT count(uid) as nb_canceled_project FROM sr_project WHERE uid_client='${uid_client}' AND status IN('cancelled-before-qualification','cancelled-after-qualification')`
                    connection.query(QUERY3, (err, result3) => {
                        if(err) {
                            console.log("err: "+err)
                            return res.send(err)
                        } else {
                            return res.json({
                                data: {nb_project: result1[0].nb_project, nb_activated_project: result2[0].nb_activated_project, nb_canceled_project: result3[0].nb_canceled_project}
                            })
                        }
                    })
                }
            })
		}
	})
})
app.get('/get_dialer_prefix', (req, res) => {
    const { first_digits } = req.query
	const QUERY = `SELECT ext FROM sr_dialer_prefix WHERE first_digits='${first_digits}'`
	connection.query(QUERY, (err, result) => {
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
    //host: 'mail.smtp2go.com', // <= your smtp server here
    //port: 2525, // <= connection port
    //secure: true, // use SSL or not
    //auth: {
    //   user: 'soumissionrenovation.ca', // <= smtp login user
    //   pass: 'AVxHxsYk7xhw' // <= smtp login pass
    //}
	host: '127.0.0.1',
	port: 25
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
                    const SELECT_SERVICE_QUERY = `SELECT name_${result_client[0].lang} as name FROM sr_service WHERE uid='${uid_service}'`
                    connection.query(SELECT_SERVICE_QUERY, (err, result3) => {
                            const SELECT_EMAIL_QUERY = `SELECT subject_${result_client[0].lang} as subject, content_${result_client[0].lang} as content FROM sr_email WHERE name='${name}' AND active='yes'`
                            connection.query(SELECT_EMAIL_QUERY, (err, result2) => {
                                if(err) {
                                    console.log(err)
                                    return res.send(err)
                                } else {
                                    var content = result2[0].content;
                                    var questions = "";
                                    var service = "rénovation"
                                    if(result3[0] !== undefined){
                                        service = result3[0].name
                                    }
                                    if (result !== undefined){
                                        result.forEach(element => {
                                            questions += `<li>${element.question}</li>`
                                        });
                                    }
                                    content = content.replace(`::questions::`, `<ul>${questions}<li>${message}</li></ul>`)
                                    content = content.replace(`::service::`, `<b>${service}</b>`)
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
                    })
            })
        }
    })
})
//#endregion

//#region Upload File
app.post('/upload-file', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
            console.log("UPLOAD FAILED")
        } else {
            console.log("UPLOAD SUCCESS: " + req.files.avatar.name)

            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/' + avatar.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
})
//#endregion

app.listen(4000, () => {
    console.log('Le serveur roule sur le port 4000')
})