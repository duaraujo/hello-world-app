const fs = require('fs');

exports.findAllFolder = (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;
  if (!directoryPath) {
    return res.status(400).send('Path is required');
  }
  fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).send(`Unable to scan directory: ${err}`);
    }
    const folders = files
      .filter((file) => file.isDirectory())
      .map((file) => file.name);

    res.json(folders);
  });
};
