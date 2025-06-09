import React from 'react';
import { styled } from '@mui/material/styles';
import { Button, Switch, TextField, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import style from './App.module.css';
import service from './services';

function App() {

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<any>(false);
  const [fileKey, setFileKey] = React.useState<string | null>(null);
  const [keyInput, setKeyInput] = React.useState<string>('');
  const [mode, setMode] = React.useState<'download' | 'upload'>('upload');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files !== null) {
      setFile(event.target.files[0]);
      setPreview(URL.createObjectURL(event.target.files[0]));
    } else {
      setFile(null);
    }
  };

  const handleFileDownload = () => {
    service.http.post('/api/v1/file/download', {
      filename: keyInput,
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', keyInput);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file as Blob);
    service.http.post('/api/v1/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log('File uploaded successfully:', response.data);
        setFile(null);
        setPreview(false);
        setFileKey(response.data.file);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
  }

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  return (
    <div className={style.View}>
      <form
        className={style.Form}
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >

        <Typography>
          Download
          <Switch
            checked={mode === 'upload'}
            onChange={function (event: React.ChangeEvent<HTMLInputElement>) {
              setMode(event.target.checked ? 'upload' : 'download');
              setFile(null);
              setPreview(false);
              setFileKey(null);
            }}
          />
          Upload
        </Typography>

        <br />

        {mode === 'upload' && (<Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
            multiple
          />
        </Button>)}

        {mode === 'download' && (
          <>
            <TextField
              label="File Key"
              variant="outlined"
              value={keyInput}
              onChange={(e: any) => setKeyInput(e.target.value)}
              fullWidth
            />
            <br />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileDownload}
            >
              Download File
            </Button>
          </>
        )}

        <br />

        {file && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{file.name}</td>
                <td>{(file.size / 1024).toFixed(2)} KB</td>
                <td>{file.type || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        )}

        <br />

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}

        <br />

        {file && (
          <Button type="submit" className={style.Button}>
            Submit
          </Button>
        )}

        {fileKey && (
          <div className={style.fileKey}>
            <span>File Key: {fileKey}</span>
          </div>
        )}

      </form>
    </div>
  )
}

export default App;
