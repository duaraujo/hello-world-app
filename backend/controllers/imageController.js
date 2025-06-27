const fs = require('fs');
const path = require('path');


exports.findAllByAnalito = (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

  fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }

    const images = files
      .filter((file) => file.isFile() && imageExtensions.includes(path.extname(file.name).toLowerCase()))
      .map((file) => {
        const filePath = path.join(directoryPath, file.name);
        const base64 = fs.readFileSync(filePath, 'base64');
        return {
          name: file.name,
          base64: `data:image/${path.extname(file.name).substring(1)};base64,${base64}`,
        };
      });

    res.json(images);
  });
};
