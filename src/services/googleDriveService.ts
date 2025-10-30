import { User, UserStatus, AppData } from './../types';
import { INITIAL_MOCK_DATA } from './../constants';

const DATA_FILE_NAME = 'gest-immo-pro-data.json';
const DRIVE_FOLDER_NAME = 'Dati App Gestore Immobili PRO';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

const checkGisLoaded = (callback: () => void) => {
    if (gisInited) {
        callback();
        return;
    }
    const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(interval);
            gisInited = true;
            callback();
        }
    }, 100);
};

const checkGapiLoaded = (callback: () => void) => {
    if (gapiInited) {
        callback();
        return;
    }
    const interval = setInterval(() => {
        if (window.gapi && window.gapi.client) {
            clearInterval(interval);
            gapiInited = true;
            callback();
        }
    }, 100);
};

export const init = (callback: (isReady: boolean) => void) => {
    checkGisLoaded(() => {
        try {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: '',
            });
            console.log("Google Token Client initialized.");

            checkGapiLoaded(() => {
                window.gapi.load('client', async () => {
                    await window.gapi.client.init({
                        apiKey: process.env.API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    });
                    console.log("GAPI client initialized.");
                    callback(true);
                });
            });
        } catch (error) {
            console.error("Error initializing Google services:", error);
            callback(false);
        }
    });
};

export const signIn = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      return reject(new Error("Google Client not initialized."));
    }

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        return reject(resp);
      }
      
      window.gapi.client.setToken(resp);

      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { 'Authorization': `Bearer ${resp.access_token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch user info');

        const profile = await response.json();
        
        const user: User = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          status: UserStatus.ACTIVE
        };

        resolve(user);
      } catch (error) {
        reject(error);
      }
    };
    
    tokenClient.requestAccessToken({ prompt: '' });
  });
};

export const signOut = () => {
  const token = window.gapi.client.getToken();
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken(null);
    });
  }
};

const findFile = async (fileName: string): Promise<string | null> => {
    const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
    });
    if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
    }
    return null;
};

const readFile = async (fileId: string): Promise<AppData> => {
    const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
    });
    return response.result as AppData;
};

const createFile = async (fileName: string, content: AppData): Promise<string> => {
    const response = await window.gapi.client.drive.files.create({
        resource: {
            name: fileName,
        },
        media: {
            mimeType: 'application/json',
            body: JSON.stringify(content)
        },
        fields: 'id',
    });
    return response.result.id;
};

export const findOrCreateDataFile = async (): Promise<{ fileId: string; data: AppData; }> => {
    let fileId = await findFile(DATA_FILE_NAME);
    if (fileId) {
        const data = await readFile(fileId);
        return { fileId, data };
    } else {
        const data = INITIAL_MOCK_DATA;
        fileId = await createFile(DATA_FILE_NAME, data);
        return { fileId, data };
    }
};

export const saveDataToDrive = async (fileId: string, data: AppData): Promise<void> => {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
        name: DATA_FILE_NAME,
        mimeType: 'application/json',
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(data) +
        close_delim;

    await window.gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
    });
};