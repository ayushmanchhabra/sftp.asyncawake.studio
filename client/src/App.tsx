import React from 'react';
import { styled } from '@mui/material/styles';
import { Button, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import style from './App.module.css';
import service from './services';

function App() {

  const [file, setFile] = React.useState<File | null>(null);
  const [fileKey, setFileKey] = React.useState<string | null>(null);
  const [keyInput, setKeyInput] = React.useState<string>('');
  const [mode, setMode] = React.useState<'download' | 'upload'>('upload');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files !== null) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleFileDownload = () => {
    let fileName = '';
    service.http.post('/api/v1/file/info', {
      filename: keyInput
    })
      .then(response => {
        fileName = response.data.filename;
      }).then(() => {
        service.http.post('/api/v1/file/download', {
          filename: keyInput,
        })
          .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch(error => {
            console.error('Error downloading file:', error);
          });
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                  <TableCell>{file.type || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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
