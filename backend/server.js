const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const sharp = require('sharp');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const rename = util.promisify(fs.rename);
const access = util.promisify(fs.access);

const archiver = require('archiver');


const app = express();
app.use(express.json());
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));


app.get('/download', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;

  console.log(directoryPath)
  if (!fs.existsSync(directoryPath)) {
    return res.status(404).send('Directory not found');
  }

  const zipFileName = `${path.basename(directoryPath)}.zip`;
  const zipFilePath = path.join(__dirname, zipFileName);

  res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
  res.setHeader('Content-Type', 'application/zip');

  // Criar um arquivo ZIP de forma stream
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Nível de compressão
  });

  // Encaminhar o arquivo ZIP para a resposta HTTP
  archive.pipe(res);

  // Adicionar todos os arquivos e pastas do diretório ao arquivo ZIP
  archive.directory(directoryPath, false);

  // Finalizar o arquivo ZIP
  archive.finalize();

  // Tratamento de erros
  archive.on('error', (err) => {
    res.status(500).send(`Error creating ZIP file: ${err.message}`);
  });
});



app.get('/new-folders', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;

  if (!req.query.directoryPath) {
    return res.status(400).send('Path is required');
  }

  fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).send(`Unable to scan directory: ${err}`);
    }

    // Filtra apenas diretórios
    const folders = files.filter((file) => file.isDirectory());

    const result = [];

    // Processa cada pasta para buscar o arquivo JSON e extrair a variável `name`
    folders.forEach((folder) => {
      const folderPath = path.join(directoryPath, folder.name);
      const jsonFilePath = path.join(folderPath, 'Data.json'); // Substitua 'file.json' pelo nome correto do arquivo JSON.

      let nameValue = null; // Valor padrão caso o arquivo JSON ou a variável `name` não exista

      if (fs.existsSync(jsonFilePath)) {
        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
          if (jsonData.name) {
            nameValue = jsonData.name;
          }
        } catch (error) {
          console.error(`Erro ao ler o arquivo JSON na pasta ${folder.name}: ${error.message}`);
        }
      }

      // Adiciona o objeto ao resultado com `nameFolder` e `name`
      result.push({
        nameFolder: folder.name,
        name: nameValue,
      });
    });

    res.json(result);
  });
});


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


app.get('/get-inference-training', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;
  const inferenceFlag = req.query.inference === 'true';
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

  const findFolderRecursively = (currentPath, folderNameOriginal) => {
    let folderName = folderNameOriginal.toLowerCase();
    const directories = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const dir of directories) {
      if (dir.isDirectory()) {
        if (dir.name.toLowerCase() === folderName) {
          return path.join(currentPath, dir.name);
        }
        const foundPath = findFolderRecursively(path.join(currentPath, dir.name), folderName);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  };

  async function convertImageToBase64(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const resizedImageBuffer = await sharp(imageBuffer)
        .rotate()
        .resize({ width: 500 })
        .jpeg({ quality: 40 })
        .toBuffer();

      return resizedImageBuffer.toString('base64');
    } catch (error) {
      console.error(`Erro ao converter a imagem para base64: ${imagePath}`, error);
      return null;
    }
  }

  const targetFolderName = inferenceFlag ? 'inference' : 'training';
  const targetFolderPath = findFolderRecursively(directoryPath, targetFolderName);

  if (!targetFolderPath) {
    return res.status(404).json({ error: `${targetFolderName} folder not found` });
  }

  fs.readdir(targetFolderPath, { withFileTypes: true }, async (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }

    const imageFiles = files
      .filter((file) => file.isFile() && imageExtensions.includes(path.extname(file.name).toLowerCase()));

    if (imageFiles.length === 0) {
      return res.status(404).json({ error: 'No image files found in the directory' });
    }

    // Usa o nome da primeira imagem encontrada para localizar o arquivo JSON correspondente
    let mainImageFile = imageFiles[0];
    let jsonFileName = path.basename(mainImageFile.name, path.extname(mainImageFile.name));

    // Remove o sufixo '-extra-1' se estiver presente
    if (jsonFileName.endsWith('-extra-1')) {
      jsonFileName = jsonFileName.replace('-extra-1', '');
    }
    jsonFileName += '.json';
    const jsonFilePath = path.join(targetFolderPath, jsonFileName);

    let analystName = 'Unknown';
    let datetime = 'Unknown';

    if (fs.existsSync(jsonFilePath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        analystName = jsonData.analystName || 'Unknown';
        datetime = jsonData.datetime || 'Unknown';
      } catch (error) {
        console.error(`Erro ao ler ou analisar o arquivo JSON: ${jsonFilePath}`, error);
      }
    } else {
      console.warn(`Arquivo JSON correspondente não encontrado: ${jsonFilePath}`);
    }

    const images = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(targetFolderPath, file.name);
        const base64 = await convertImageToBase64(filePath);
        return {
          name: file.name,
          base64: base64,
        };
      })
    );

    const lastElement = images.pop();
    if (lastElement !== undefined) {
      images.unshift(lastElement);
    }

    res.json({
      analystName: analystName,
      datetime: datetime,
      images: images
    });
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

function deleteImage(directoryPath, imageName) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, items) => {
      if (err) {
        return reject(err);
      }

      items.forEach(item => {
        const itemPath = path.join(directoryPath, item);

        fs.stat(itemPath, (err, stats) => {
          if (err) {
            return reject(err);
          }

          if (stats.isDirectory()) {
            // Se for um diretório, chama a função recursivamente
            deleteImage(itemPath, imageName)
              .then(resolve)
              .catch(reject);
          } else if (stats.isFile() && item === imageName) {
            // Se for um arquivo e o nome bater, deleta
            fs.unlink(itemPath, err => {
              if (err) {
                return reject(err);
              }
              resolve('Imagem deletada com sucesso');
            });
          }
        });
      });
    });
  });
}


app.delete('/delete-image', async (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const { directoryPath, imageName } = req.query;

  if (!directoryPath || !imageName) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  try {
    const result = await deleteImage(`${pathDefault}/${directoryPath}`, imageName);
    res.json({ message: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar a imagem' });
  }
});


async function findAndPromoteImage(directoryPath, newMainImageName) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, items) => {
      if (err) {
        return reject(err);
      }

      items.forEach(async item => {
        const itemPath = path.join(directoryPath, item);

        try {
          const stats = await fs.promises.stat(itemPath);

          if (stats.isDirectory()) {
            await findAndPromoteImage(itemPath, newMainImageName);
          } else if (stats.isFile()) {
            const [imageId, extraNumber] = item.split('-extra-');
            if (item === newMainImageName) {
              const oldMainImagePath = path.join(directoryPath, `${imageId}.jpg`);

              await fs.promises.rename(itemPath, oldMainImagePath);
              await fs.promises.rename(oldMainImagePath, newMainImageName);

              resolve('Imagens renomeadas com sucesso');
            }
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}


app.put('/promote-image', async (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const { directoryPath, imageName } = req.body;

  if (!directoryPath || !imageName) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  async function findImageAndRename(directory, imageName) {
    const files = await readdir(directory);

    for (const fileName of files) {
      const filePath = path.join(directory, fileName);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        // Recursively search in subdirectories
        const result = await findImageAndRename(filePath, imageName);
        if (result) return result;
      } else if (fileName === imageName) {
        const baseName = imageName.split('-extra-')[0];
        const mainImagePath = path.join(directory, `${baseName}.jpg`);
        const tempMainImagePath = path.join(directory, `${baseName}-temp.jpg`);

        // Verificar se a imagem principal existe
        if (await fileExists(mainImagePath)) {
          // Renomear a imagem principal para um nome temporário
          await rename(mainImagePath, tempMainImagePath);
          console.log(`Renomeou temporariamente ${mainImagePath} para ${tempMainImagePath}`);
        }

        // Renomear a imagem "extra" para o nome principal
        await rename(filePath, mainImagePath);
        console.log(`Renomeou ${filePath} para ${mainImagePath}`);

        // Renomear o arquivo temporário para o nome "extra"
        const newExtraImageName = `${baseName}-extra-${imageName.split('-extra-')[1]}`;
        const newExtraImagePath = path.join(directory, newExtraImageName);

        if (await fileExists(tempMainImagePath)) {
          await rename(tempMainImagePath, newExtraImagePath);
          console.log(`Renomeou ${tempMainImagePath} para ${newExtraImagePath}`);
        }

        return true;
      }
    }
    return false;
  }

  // Função para verificar se um arquivo existe
  async function fileExists(filePath) {
    try {
      await access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  try {
    const fullPath = path.join(pathDefault, directoryPath);
    const imageFoundAndRenamed = await findImageAndRename(fullPath, imageName);

    if (imageFoundAndRenamed) {
      res.json({ message: 'Imagem promovida com sucesso' });
    } else {
      res.status(404).json({ error: 'Imagem não encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao promover a imagem' });
  }
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

app.delete('/image', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const { directoryPath, imageName, fileJson } = req.query;

  const imagePath = path.join(pathDefault, directoryPath, imageName);
  const filePath = path.join(pathDefault, directoryPath, fileJson);

  // Deletar a imagem
  fs.unlink(imagePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to delete image' });
    }

    // Ler o arquivo JSON
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read JSON file' });
      }

      try {
        const jsonData = JSON.parse(data);

        // Verificar se o imageName está em extraFileNames e remover
        const index = jsonData.sample.extraFileNames.indexOf(imageName);
        if (index !== -1) {
          jsonData.sample.extraFileNames.splice(index, 1); // Remover o arquivo da lista
        } else {
          return res.status(404).json({ error: 'Image not found in extraFileNames' });
        }

        // Escrever o JSON atualizado no arquivo
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
            return res.status(500).json({ error: 'Unable to update JSON file' });
          }

          res.status(200).json({ message: 'Image deleted and JSON updated successfully' });
        });
      } catch (parseErr) {
        return res.status(500).json({ error: 'Error parsing JSON file' });
      }
    });
  });
});


//----------------------------------------------------------------------------



// Endpoint para atualizar arquivo
app.post('/update-file', (req, res) => {
  const pathDefault = '/home/eduardo_araujo/Documentos/project';
  const directoryPath = `${pathDefault}/${req.body.urlPath}`;
  const fileName = req.body.fileName || 'novo_arquivo.json';
  const filePath = path.join(directoryPath, fileName);
  const fileContent = req.body.fileContent;

  // Função para transformar conteúdo plano em JSON
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


  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File does not exist' });
  }

  // Ler o conteúdo existente do arquivo
  fs.readFile(filePath, 'utf8', (readErr, data) => {
    if (readErr) {
      return res.status(500).json({ error: 'Failed to read file' });
    }

    let existingData;
    try {
      existingData = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse existing file content' });
    }

    // Transformar o novo conteúdo em JSON
    const transformedContent = transformToJson(fileContent);

    // Atualizar os dados existentes com os novos
    const updatedData = { ...existingData, ...transformedContent };

    // Escrever os dados atualizados no arquivo
    fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to update file' });
      }
      res.json({ message: 'File updated successfully' });
    });
  });
});





//----------------------------------------------------------------------------

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
  //const pathDefault = 'http://192.168.0.157:8081';
  const directoryPath = `${pathDefault}/${req.query.directoryPath}`;
  console.log(directoryPath)
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
            jsonContent.sample.extraFileNamesBase64 = base64ExtraFiles;
          }

          // Convertendo datetime para um objeto de Data para comparação
          const sampleDatetime = new Date(jsonContent.sample.datetime.split(" ")[0].replace(/\./g, '-'));

          // Aplicando os filtros de data e analystName, se fornecidos
          if (
            (!analystName || jsonContent.sample.analystName.toLowerCase() === analystName.toLowerCase()) &&
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
