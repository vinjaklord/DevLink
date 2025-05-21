import fs from 'fs';

const uploadAsStream = async (req, res, next) => {
  const FILE_PATH = './uploads/stream.pdf';

  const uploadFile = async () => {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(FILE_PATH);
      // open wird beim Öffnen des Streams ausgelöst
      stream.on('open', () => {
        console.log('Stream open ... 0.000%');
        req.pipe(stream);
      });

      // drain wird nach jedem Schreiben eines Datenpaketes (chunk) ausgelöst
      stream.on('drain', () => {
        const written = parseInt(stream.bytesWritten);
        const total = parseInt(req.headers['content-length']);
        const percent = ((written / total) * 100).toFixed(2);
        console.log(`Processing ... ${percent}% done`);
      });

      // close wird nach erfolgreichem Schreiben des gesamten Streams ausgelöst
      stream.on('close', () => {
        resolve(FILE_PATH);
      });

      // error wird bei einem Fehler während der Stream-Verarbeitung ausgelöst
      stream.on('error', (error) => {
        console.log(error);
        reject(error);
      });
    });
  };

  const response = await uploadFile();
  res.send(response);
};

export { uploadAsStream };
