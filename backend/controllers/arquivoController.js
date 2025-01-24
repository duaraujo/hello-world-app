const fs = require('fs');
const path = require('path');


exports.findAllFiles = (req, res) => {
    const pathDefault = '/home/eduardo_araujo/Documentos/project';
    const directoryPath = `${pathDefault}/${req.query.urlPath}`;

    try {
        const files = fs.readdirSync(directoryPath);

        const jsonFiles = files.filter(file => typeof file === 'string' && file.endsWith('.json'));

        const fileDetails = jsonFiles.map(file => {
            const filePath = path.join(directoryPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const fileContentBase64 = Buffer.from(fileContent).toString('base64');
            return {
                fileName: file,
                contentBase64: fileContentBase64
            };
        });

        res.json(fileDetails);
    } catch (err) {
        return res.status(500).json({ error: 'Unable to scan directory' });
    }
};