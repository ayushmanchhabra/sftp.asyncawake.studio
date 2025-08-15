import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import { config } from 'dotenv';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';

config();

function upload(req, res) {

    const file = req.file;

    const srcPath = path.resolve(file.path);
    const outPath = path.resolve('uploads', `${file.filename}_${file.originalname}`);

    fs.renameSync(srcPath, outPath);
    fs.chmodSync(outPath, 0o444);

    res.status(200).json({
        file: req.file.filename,
        message: 'File uploaded successfully',
    });
}

function download(req, res) {
    const filename = req.body.filename;

    let fileExists = false;

    const files = fs.readdirSync('uploads/');

    for (const file of files) {
        const key = file.split('_')[0];
        if (key === filename) {
            const filePath = path.resolve('uploads', file);
            return res.download(filePath, function (error) {
                fileExists = true;
                if (error) {
                    console.error('Error downloading file:', error);
                    return res.status(500).json('Internal Server Error');
                }

                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log(`File ${file} deleted after download.`);
                    }
                });
            });
        }
    }

    if (fileExists === false) {
        return res.status(404).json({ message: 'The requested file does not exist or has already been downloaded.' });
    }

}

function info(req, res) {
    const filename = req.body.filename;
    const files = fs.readdirSync('uploads/');
    let fileInfo = undefined;

    for (const file of files) {
        const currentFilename = file.split('_')[0];
        if (currentFilename === filename) {
            const filePath = path.resolve('uploads', file);
            const stats = fs.statSync(filePath);
            fileInfo = {
                filename: file.split('_').slice(1).join('_'),
                size: stats.size,
            };
            return res.status(200).json(fileInfo);
        }
    }

    res.status(200).json(fileInfo);
}

/**
 * 
 * @param {Express} router 
 * @returns {Promise<Express>}
 */
async function setupServer(router) {

    const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

    if (CLIENT_ORIGIN === undefined) {
        throw new Error('CLIENT_ORIGIN environment variable has not been set.');
    }

    router.use(cors({
        origin: `https://${CLIENT_ORIGIN}`,
        credentials: true,
        optionsSuccessStatus: 200,
    }))
    router.use(express.json());
    router.use(helmet());
    // eslint-disable-next-line no-unused-vars
    router.use((err, req, res, next) => {
        console.error(err.stack);

        if (err.code === 'LIMIT_FILE_SIZE') {
            // Multer throws error when the file size exceeds the limit
            return res.status(413).json({ message: 'File size exceeds the limit of 1 GB' });
        } else {
            return res.status(500).json({ message: '500 Internal Server Error' })
        }
    })

    return router;
}

export async function main() {
    const SERVER_HOST = process.env.SERVER_HOST;
    const SSL_PRIVATE_KEY_PATH = process.env.SSL_PRIVATE_KEY_PATH;
    const SSL_CERTIFICATE_PATH = process.env.SSL_CERTIFICATE_PATH;

    if (process.env.FILE_UPLOAD_DIR === undefined) {
        throw new Error('FILE_UPLOAD_DIR environment variable has not been set.');
    }

    const uploader = multer({
        dest: path.resolve(process.env.FILE_UPLOAD_DIR),
        limits: {
            fileSize: 1 * 1024 * 1024 * 1024, // 1 GB in bytes
        },
    });

    const router = await setupServer(express());
    router.post('/api/v1/file/upload', uploader.single('file'), upload);
    router.post('/api/v1/file/download', download);
    router.post('/api/v1/file/info', info);

    const options = {
        key: fs.readFileSync(SSL_PRIVATE_KEY_PATH),
        cert: fs.readFileSync(SSL_CERTIFICATE_PATH)
    };

    const server = https.createServer(options, router);
    server.listen(8443, SERVER_HOST, () => {
        console.log(`Server listening on https://${SERVER_HOST}:8443`);
    });

    return router;
}

await main();
