const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));







app.get('/folders', (req, res) => {
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
});

app.get('/images', (req, res) => {
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
});

app.delete('/image', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const { directoryPath, imageName } = req.query;
  const imagePath = path.join(pathDefault, directoryPath, imageName);

  fs.unlink(imagePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to delete image' });
    }
    res.status(200).json({ message: 'Image deleted successfully' });
  });
});


app.get('/arquivos', (req, res) => {
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
});


app.post('/create-file', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.body.urlPath}`;
  const fileName = req.body.fileName || 'novo_arquivo.json';
  const filePath = path.join(directoryPath, fileName);
  const fileContent = req.body.fileContent;

  // Verifica se o diretório existe
  if (!fs.existsSync(directoryPath)) {
    return res.status(400).json({ error: 'Directory does not exist' });
  }

  // Função para transformar o conteúdo plano em formato JSON
  const transformToJson = (content) => {
    const result = {};
    Object.keys(content).forEach(key => {
      const keys = key.split('.');
      keys.reduce((acc, part, index) => {
        if (index === keys.length - 1) {
          acc[part] = content[key];
        } else {
          if (!acc[part]) {
            acc[part] = {};
          }
          return acc[part];
        }
      }, result);
    });
    return result;
  };

  const transformedContent = transformToJson(fileContent);

  // Cria e escreve no novo arquivo
  fs.writeFile(filePath, JSON.stringify(transformedContent, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create file' });
    }
    res.json({ message: 'File created successfully' });
  });
});

















app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
