import { settings } from "./Settings";
import axios from "axios";
import { AxiosInstance } from "axios";
import getRepoInfo from "git-repo-info";

export class Updates {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: 'https://gitlab.com/api/v4/',
      timeout: 2000,
      headers: {'PRIVATE-TOKEN': settings.load('currentToken', '')}
    })
  }

  getUpdates() {
    return new Promise((resolve, reject) => {
      const info = getRepoInfo();

      if (info.branch !== 'master') {
        return reject({
          message: `cannot check for updates from '${info.branch}' branch`,
          status: 'INVALID'
        });
      }

      this.instance.get('projects/22857479/repository/commits')
        .then(function (response) {

          const localCommit = info.sha;

          const diff = response.data.findIndex((remoteCommit: any) => {
            return remoteCommit.id === localCommit;
          });

          const commitWord = diff === 1 ? 'commit' : 'commits';

          const message = diff > 0 ? `Your version is ${diff} ${commitWord} behind master` : 'You version is up to date'

          if (diff > 0) {
            return resolve({
              message: message,
              diff: diff,
              status: 'UPDATES'
            })
          }

          return resolve({
            message: message,
            diff: diff,
            status: 'UP_TO_DATE'
          })

        })
        .catch((err) => {
          return reject({
            error: err, 
            message: err.message,
            status: 'ERROR'
          });
        })
    });
  }
}

export default Updates; 