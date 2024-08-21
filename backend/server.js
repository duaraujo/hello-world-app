const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const sharp = require('sharp');

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

  if (!fs.existsSync(directoryPath)) {
    return res.status(400).json({ error: 'Directory does not exist' });
  }

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

  fs.writeFile(filePath, JSON.stringify(transformedContent, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create file' });
    }
    res.json({ message: 'File created successfully' });
  });
});



app.get('/json-files', async (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;
  const analystName = req.query.analystName;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  const result = [];

  async function convertImageToBase64(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);

      // Usando sharp para redimensionar e comprimir a imagem
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize({ width: 300 }) // Redimensiona a largura para 500px, mantendo a proporção
        .jpeg({ quality: 40 })  // Converte para JPEG e reduz a qualidade para 70%
        .toBuffer();

      return resizedImageBuffer.toString('base64');
    } catch (error) {
      console.error(`Erro ao converter a imagem para base64: ${imagePath}`, error);
      return null;
    }
  }

  async function readJsonFilesFromDir(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        await readJsonFilesFromDir(fullPath);
      } else if (path.extname(file.name) === '.json') {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        try {
          const jsonContent = JSON.parse(fileContent);

          if (jsonContent.sample && jsonContent.sample.colorReagent) {
            delete jsonContent.sample.colorReagent;
            delete jsonContent.sample.sourceStock;
            delete jsonContent.sample.sourceAliquot;
          }

          // Converte a propriedade fileName para base64
          if (jsonContent.sample && jsonContent.sample.fileName) {
            const imagePath = path.join(dirPath, jsonContent.sample.fileName);
            const base64Image = await convertImageToBase64(imagePath);
            jsonContent.sample.title = jsonContent.sample.fileName;
            if (base64Image) {
              jsonContent.sample.fileName = base64Image;
            }
          }

          // Converte extraFileNames para base64, se existir
          if (jsonContent.sample && jsonContent.sample.extraFileNames) {
            const base64ExtraFiles = await Promise.all(
              jsonContent.sample.extraFileNames.map(async (extraFileName) => {
                const extraImagePath = path.join(dirPath, extraFileName);
                return await convertImageToBase64(extraImagePath);
              })
            );
            jsonContent.sample.extraFileNames = base64ExtraFiles;
          }

          // Convertendo datetime para um objeto de Data para comparação
          const sampleDatetime = new Date(jsonContent.sample.datetime.split(" ")[0].replace(/\./g, '-'));

          // Aplicando os filtros de data e analystName, se fornecidos
          if (
            (!analystName || jsonContent.sample.analystName === analystName) &&
            (!startDate || sampleDatetime >= startDate) &&
            (!endDate || sampleDatetime <= endDate)
          ) {
            result.push(jsonContent);
          }
        } catch (error) {
          console.error(`Erro ao parsear o arquivo JSON: ${fullPath}`, error);
        }
      }
    }
  }

  try {
    await readJsonFilesFromDir(directoryPath);
    res.json(result);
  } catch (err) {
    res.status(500).send(`Erro ao ler o diretório: ${err.message}`);
  }
});















app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
