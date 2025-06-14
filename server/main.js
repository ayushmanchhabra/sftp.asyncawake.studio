import fs from 'node:fs';
import path from 'node:path';

import { config } from 'dotenv';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';

config();
const uploader = multer({ dest: 'uploads/' })

function upload(req, res) {

    const file = req.file;

    const srcPath = path.resolve(file.path);
    const outPath = path.resolve('uploads', `${file.filename}_${file.originalname}`);

    fs.renameSync(srcPath, outPath);

    res.status(200).json({
        file: req.file.filename,
        message: 'File uploaded successfully',
    });
}

function download(req, res) {
    const filename = req.body.filename;

    const files = fs.readdirSync('uploads/');

    for (const file of files) {
        const key = file.split('_')[0];
        if (key === filename) {
            const filePath = path.resolve('uploads', file);
            res.download(filePath, function (error) {
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

}

function info (req, res) {
    const filename = req.body.filename;
    const files = fs.readdirSync('uploads/');
    let fileInfo = undefined;
    
    for (const file of files) {
        const currentFilename = file.split('_')[0];
        if (currentFilename === filename) {
            const filePath = path.resolve('uploads', file);
            const stats = fs.statSync(filePath);
            fileInfo = {
                filename: file.split('_')[1],
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

    const CLIENT_HOST = process.env.CLIENT_HOST;
    const CLIENT_PORT = process.env.CLIENT_PORT;

    if (CLIENT_HOST === undefined) {
        throw new Error('CLIENT_HOST environment variable has not been set.');
    }

    if (CLIENT_PORT === undefined) {
        throw new Error('CLIENT_PORT environment variable has not been set.');
    }

    router.use(cors({
        origin: `http://${CLIENT_HOST}:${CLIENT_PORT}`,
        credentials: true,
        optionsSuccessStatus: 200,
    }))
    router.use(express.json());
    router.use(helmet());
    router.use((err, req, res) => {
        console.error(err.stack)
        res.status(500).send('500 Internal Server Error')
    })

    return router;
}

export async function main() {
    const SERVER_HOST = process.env.SERVER_HOST;
    const SERVER_PORT = process.env.SERVER_PORT;

    const router = await setupServer(express());
    router.post('/api/v1/file/upload', uploader.single('file'), upload);
    router.post('/api/v1/file/download', download);
    router.post('/api/v1/file/info', info);

    router.listen(SERVER_PORT, SERVER_HOST, function () {
        console.log(`Listening on http://${SERVER_HOST}:${SERVER_PORT}`)
    });

    return router;
}

await main();
