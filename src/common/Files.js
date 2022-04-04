import fs from "fs";

export class Files {

  readJsonFile(file, validationCallback) {
    if (!file || !validationCallback) {
      throw new TypeError("file and validationCallback required");
    }
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);

          if (validationCallback(content)) {
            resolve(content);
          } else {
            reject(content);
          }
        } catch (e) {
          reject(e);
        }
      };
      fr.onerror = (e) =>{
        reject(e);
      }
      fr.readAsText(file);
    });
  }

  writeJsonFile(file, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, data, (err) => {
        if (err) {
          reject(err);
        }
        resolve(file);
      });
    });
  }
}

export const files = new Files()
