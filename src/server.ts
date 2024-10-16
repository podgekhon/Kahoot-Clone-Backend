import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
/// ////////------UNCOMMENT THIS LINE BELOW--------//////////
// import { getData } from './dataStore.js';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file),
  { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
import {
  adminAuthRegister,
  adminUserPasswordUpdate,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate
} from './auth';
import { adminQuizCreate, adminQuizNameUpdate} from './quiz';
import { clear } from './other';
import { validateToken, isErrorMessages } from './helperfunction';
import {errorMessages, emptyReturn} from './interface';
// import { getData } from './dataStore';

export enum httpStatus {
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  SUCCESSFUL_REQUEST = 200
}

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(httpStatus.BAD_REQUEST);
  }

  return res.json(result);
});

// ------clear---------///
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
});

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  console.log(`What the hell`);
  const { email, password, nameFirst, nameLast } = req.body;

  const result = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in result) {
    res.status(httpStatus.BAD_REQUEST).json(result);
    return;
  }
  return res.json(result);
});

// adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);

  if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// ------clear---------/ //
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
});
// adminUserPasswordUpdate\
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const validtoken = validateToken(token);
  // invalid token
  if ('error' in validtoken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'token is empty or invalid'
    });
  }

  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }

  return res.json(result);
});

// adminUserPasswordUpdate\
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const validtoken = validateToken(token);
  // invalid token
  if ('error' in validtoken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'token is empty or invalid'
    });
  }

  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }

  return res.json(result);
});

// quizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  console.log(`What the`);
  const { token, name, description } = req.body;
  const validtoken = validateToken(token);
  // invalid token
  if ('error' in validtoken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'token is empty or invalid'
    });
  }

  const result = adminQuizCreate(token, name, description);
  if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }
  return res.json(result);
});


// quiznameupdate
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, name } = req.body;
  // Validate the token
  const validToken = validateToken(token);
  if ('error' in validToken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'Token is empty or invalid',
    });
  }


  const result = adminQuizNameUpdate(token, parseInt(quizid), name);
  if (isErrorMessages(result) && 
    (result.error === 'Quiz ID does not refer to a valid quiz.' || 
     result.error === 'Quiz ID does not refer to a quiz that this user owns.')) {
      return res.status(httpStatus.FORBIDDEN).json(result);
  }
  else if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  } 
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});


app.get('/v1/admin/user/details', (req, res) => {
  const { token } = req.body;
  const result = validateToken(token);
  if ('error' in result) {
    return res.status(401).json({error: 'Unknown Type: string - error'});
  }
  const userDetails = adminUserDetails(token);
  if ('error' in userDetails) {
    return res.status(401).json({ error: "Unknown Type: string - error" });
  }
  return res.status(200).json(userDetails);
});


// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
