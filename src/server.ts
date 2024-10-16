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
// import { adminQuizDescriptionUpdate } from './quiz';

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
import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminTrashList,
  adminQuizDescriptionUpdate
} from './quiz';
import { clear } from './other';
import { validateToken } from './helperfunction';

// import { getData } from './dataStore';

enum httpStatus {
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

// adminUserPasswordUpdate
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

// adminQuizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
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

// adminQuizDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, description } = req.body;

  const result = adminQuizDescriptionUpdate(
    token,
    parseInt(quizid),
    description
  );

  if ('error' in result) {
    if (result.error === 'INVALID_TOKEN') {
      return res.status(httpStatus.UNAUTHORIZED).json({
        error: 'Token is empty or invalid ' +
               '(does not refer to valid logged in ' +
               'user session)'
      });
    }
    if (result.error === 'INVALID_QUIZ') {
      return res.status(httpStatus.FORBIDDEN).json({
        error:
        'Valid token is provided, but user is not an owner of this quiz, ' +
        'or quiz doesn\'t exist.'
      });
    }
    if (result.error === 'DESCRIPTION_TOO_LONG') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Description is more than 100 characters in length.'
      });
    }
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// adminUserDetails
app.get('/v1/admin/user/details', (req, res) => {
  const { token } = req.query;

  const result = adminUserDetails(token as string);
  if ('error' in result) {
    return res.status(401).json({ error: result.error });
  }

  return res.status(200).json(result);
});

// adminUserDetailsUpdate
app.put('/v1/admin/user/details', (req, res) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const result = validateToken(token);
  if ('error' in result) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Unknown Type: string - error' });
  }
  const updateResult = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in updateResult) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: 'Unknown Type: string - error' });
  }
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// delete Quiz
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const { token } = req.query;
  const { quizid } = req.params;

  const result = validateToken(token as string);
  if ('error' in result) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Unknown Type: string - error' });
  }

  const removeResult = adminQuizRemove(token as string, Number(quizid));
  if ('error' in removeResult) {
    return res.status(httpStatus.FORBIDDEN).json({ error: 'Unknown Type: string - error' });
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// get trash list
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const { token } = req.query;
  const result = validateToken(token as string);

  if ('error' in result) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Unknown Type: string - error' });
  }

  const quizzes = adminTrashList(token as string);
  if ('error' in quizzes) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Unknown Type: string - error' });
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(quizzes);
});

// adminQuizList
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const { token } = req.query;
  const quizList = adminQuizList(token as string);

  if ('error' in quizList) {
    return res.status(httpStatus.UNAUTHORIZED).json(quizList);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(quizList);
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
