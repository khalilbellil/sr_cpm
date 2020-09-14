import React,{ useState } from 'react'
import axios from 'axios';

function UploadFile() {
    const [selectedFile, setSelectedFile] = useState('');

    const onChangeHandler = (event) => {
        setSelectedFile(event.target.files[0])
        console.log(event.target.files[0])
    }
    const onClickUploadFile = (event) => {
        const data = new FormData()
        data.append('avatar', selectedFile)
        axios.post('http://localhost:4000/upload-file', data).then(res => {
            if (res.status === 200)
                alert(res.status)
        })
    }
    
    return (
        <div>
            <input type="file" name="file" onChange={onChangeHandler}></input>
            <button type="button" class="btn btn-success" onClick={onClickUploadFile}>Upload file</button>
        </div>
    )
}

export default UploadFile
