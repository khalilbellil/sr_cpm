const express = require('express')
const cors = require('cors')
const mysql = require('mysql')

const app = express()
//#region Database Config
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kookie&09',
    database: 'sr_test'
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
            return res.send('Update reussi')
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
            return res.send('Update reussi')
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
            return res.send('Update reussi')
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
    let{ uid, status } = req.query
    status = (status === "new")?"cancelled-before-qualification":"cancelled-after-qualification"
    const UPDATE_USER_QUERY = `UPDATE sr_project SET status='${status}' WHERE uid='${uid}'`
    connection.query(UPDATE_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Projet activé avec succes')
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
    const INSERT_USER_QUERY = `INSERT INTO sr_followup(uid_msg, uid_client, uid_project, followup_agent, comments) VALUES(0, 0, '${uid_msg}', '${uid_client}', '${uid_project}', '${username}', '${comments}')`
    connection.query(INSERT_USER_QUERY, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send('Historique ajouté avec succes')
        }
    })
})
//#endregion

//#region 
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
//#endregion
app.listen(4000, () => {
    console.log('Le serveur roule sur le port 4000')
})