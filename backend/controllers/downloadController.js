const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.downloadDirectory = (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;

  if (!fs.existsSync(directoryPath)) {
    return res.status(404).send('Directory not found');
  }

  const zipFileName = `${path.basename(directoryPath)}.zip`;
  res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
  res.setHeader('Content-Type', 'application/zip');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(directoryPath, false);
  archive.finalize();

  archive.on('error', (err) => {
    res.status(500).send(`Error creating ZIP file: ${err.message}`);
  });
};
