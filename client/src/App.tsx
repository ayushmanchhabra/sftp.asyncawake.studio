import React from 'react';
import { styled } from '@mui/material/styles';
import { Button, CircularProgress, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import style from './App.module.css';
import service from './services';

function App() {

  const [file, setFile] = React.useState<File | null>(null);
  const [fileKey, setFileKey] = React.useState<string | null>(null);
  const [keyInput, setKeyInput] = React.useState<string>('');
  const [mode, setMode] = React.useState<'download' | 'upload'>('upload');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files !== null) {
      const currentFile = event.target.files[0];
      if (currentFile.size > 1 * 1024 * 1024 * 1024) {
        setError('File size exceeds 1GB limit.');
      } else {
        setFile(currentFile);
      }
    } else {
      setFile(null);
    }
  };

  const handleFileDownload = () => {
    let fileName = '';
    setIsLoading(true);
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
          })
          .finally(() => {
            setIsLoading(false);
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
        setFile(null);
        setFileKey(response.data.file);
        return new Promise(resolve => {
          navigator.clipboard.writeText(response.data.file).then(() => {
            setError('');
            resolve(true);
          })
          .catch(() => {
            setError('Failed to copy file key to clipboard.');
            resolve(false);
          });
        })
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      })
      .finally(() => {
        setIsLoading(false);
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

        <Typography variant="h5" gutterBottom>
          SFTP - A secure file sharing service
        </Typography>

        <br />

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
          variant="outlined"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          sx={{
            width: 300,
            backgroundColor: '#9370db',
            color: 'white',
            marginBottom: 2,
          }}
        >
          Select files
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
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setKeyInput(event.target.value)}
              fullWidth
            />
            <br />
            <Button
              disabled={isLoading}
              variant="outlined"
              color="primary"
              onClick={handleFileDownload}
              sx={{
                width: 300,
                backgroundColor: '#9370db',
                color: 'white',
                marginBottom: 2,
              }}
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

        {error && <Typography variant="body2" color="error" align="center">{error}</Typography>}

        <br />

        {file && (
          <Button
            sx={{
              width: 300,
              backgroundColor: '#9370db',
              color: 'white',
              marginBottom: 2,
            }}
            type="submit"
          >
            Upload
          </Button>
        )}

        {fileKey && (
          <div className={style.fileKey}>
            <span>File Key: {fileKey}</span>
          </div>
        )}

        {isLoading && <CircularProgress />}

      </form>

      <Typography variant="body2" color="textSecondary" align="center">
        (c) Async Awake Studio
      </Typography>

    </div>
  )
}

export default App;
