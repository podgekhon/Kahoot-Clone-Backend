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
  adminUserDetailsUpdate,
  adminAuthLogout
} from './auth';

import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminTrashList,
  adminQuizDescriptionUpdate,
  adminQuizNameUpdate,
  adminQuizRestore,
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizQuestionRemove,
  adminQuizInfo,
  adminMoveQuizQuestion,
  adminQuizQuestionDuplicate,
  adminQuizTransfer,
  adminTrashEmpty
} from './quiz';

import { clear } from './other';
import { isErrorMessages } from './helperFunctions';
import { errorMessages } from './interface';
import { errorMap } from './errorMap';

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
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  try {
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
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
  try {
    const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    if (error.message === 'Invalid token') {
      return res.status(httpStatus.UNAUTHORIZED).json({ error: error.message });
    } else {
      return res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
});

// adminQuizCreate
const handleAdminQuizCreate = (req: Request, res: Response) => {
  const { name, description } = req.body;
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }
  try {
    const result = adminQuizCreate(token, name, description);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.post('/v1/admin/quiz', handleAdminQuizCreate);
app.post('/v2/admin/quiz', handleAdminQuizCreate);

// adminQuizNameUpdate
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, name } = req.body;

  const result = adminQuizNameUpdate(token, parseInt(quizid), name);
  if ((result as errorMessages).error === 'invalid token') {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'Token is empty or invalid',
    });
  }
  if (isErrorMessages(result) &&
    (result.error === 'Quiz ID does not refer to a valid quiz.' ||
     result.error === 'Quiz ID does not refer to a quiz that this user owns.')) {
    return res.status(httpStatus.FORBIDDEN).json(result);
  } else if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// adminQuizDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, description } = req.body;

  try {
    const result = adminQuizDescriptionUpdate(
      token,
      parseInt(quizid),
      description
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminQuizQuestionCreate
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, questionBody } = req.body;

  try {
    const result = adminQuizQuestionCreate(
      parseInt(quizid),
      questionBody,
      token
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminQuizQuestionUpdate
app.put('/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const { quizid, questionid } = req.params;
    const { token, questionBody } = req.body;

    try {
      const result = adminQuizQuestionUpdate(
        parseInt(quizid),
        parseInt(questionid),
        questionBody,
        token
      );
      return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
    } catch (error) {
      const mappedError = errorMap[error.message];
      return res.status(mappedError.status).json({ error: mappedError.message });
    }
  });

// adminUserDetails
app.get('/v1/admin/user/details', (req, res) => {
  const { token } = req.query;

  const result = adminUserDetails(token as string);
  if ('error' in result) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: result.error });
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// adminUserDetailsUpdate
app.put('/v1/admin/user/details', (req, res) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const updateResult = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in updateResult) {
    if (updateResult.error === 'invalid token') {
      return res.status(httpStatus.UNAUTHORIZED).json(updateResult);
    }
    return res.status(httpStatus.BAD_REQUEST).json(updateResult);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(updateResult);
});

// delete Quiz
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const { token } = req.query;
  const { quizid } = req.params;

  const removeResult = adminQuizRemove(token as string, Number(quizid));
  if ('error' in removeResult) {
    if (removeResult.error === 'invalid token') {
      return res.status(httpStatus.UNAUTHORIZED).json(removeResult);
    }
    return res.status(httpStatus.FORBIDDEN).json(removeResult);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// get trash list
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const { token } = req.query;

  const quizTrashList = adminTrashList(token as string);
  if ('error' in quizTrashList) {
    return res.status(httpStatus.UNAUTHORIZED).json(quizTrashList);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(quizTrashList);
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

// adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token } = req.query;

  try {
    const result = adminQuizInfo(token as string, parseInt(quizid));
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminQuizRestore
app.post('/v1/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizId as string);
  try {
    const result = adminQuizRestore(quizId, token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    if (error.message === 'invalid token') {
      return res.status(httpStatus.UNAUTHORIZED).json({ error: error.message });
    } else if (
      error.message === 'user is not the owner of this quiz' ||
      error.message === 'quiz doesnt exist'
    ) {
      return res.status(httpStatus.FORBIDDEN).json({ error: error.message });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
  }
});

// adminMoveQuizQuestion
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { quizid, questionid } = req.params;
  const { token, newPosition } = req.body;

  try {
    const result = adminMoveQuizQuestion(
      parseInt(quizid),
      parseInt(questionid),
      token,
      newPosition
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminAuthLogout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;

  const result = adminAuthLogout(token);
  if ('error' in result) {
    if (result.error === 'invalid token') {
      return res.status(httpStatus.UNAUTHORIZED).json(result);
    }
    if (result.error === 'Session not found.') {
      return res.status(httpStatus.FORBIDDEN).json(result);
    }
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// adminQuizQuestionDuplicate
app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate',
  (req: Request, res: Response) => {
    const { token } = req.body;
    const quizId = parseInt(req.params.quizId as string);
    const questionId = parseInt(req.params.questionId as string);
    try {
      const result = adminQuizQuestionDuplicate(quizId, questionId, token);
      return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
    } catch (error) {
      if (error.message === 'invalid token') {
        return res.status(httpStatus.UNAUTHORIZED).json({ error: error.message });
      } else if (
        error.message === 'quiz does not exist' ||
        error.message === 'user is not owner of this quiz'
      ) {
        return res.status(httpStatus.FORBIDDEN).json({ error: error.message });
      }
      return res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
    }
  });

// adminQuizQuestionRemove
app.delete('/v1/admin/quiz/:quizId/question/:questionId',
  (req: Request, res: Response) => {
    const { token } = req.query;
    const quizId = parseInt(req.params.quizId as string);
    const questionId = parseInt(req.params.questionId as string);

    const result = adminQuizQuestionRemove(quizId, questionId, token as string);

    if ('error' in result) {
      if (
        result.error === 'user is not the owner of this quiz' ||
      result.error === 'quiz or question doesn\'t exist'
      ) {
        return res.status(httpStatus.FORBIDDEN).json(result);
      } else if (result.error === 'token is empty or invalid') {
        return res.status(httpStatus.UNAUTHORIZED).json(result);
      } else {
        return res.status(httpStatus.BAD_REQUEST).json(result);
      }
    }

    return res.json(result);
  });

// adminQuizTransfer
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, userEmail } = req.body;

  const result = adminQuizTransfer(parseInt(quizid), token, userEmail);

  if ('error' in result) {
    const { status, message } = errorMap[result.error];
    return res.status(status).json({ error: message });
  }
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// Empty trash
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const { token, quizIds } = req.query;

  // Parse quizIds into an array of numbers
  const quizIdsArray = JSON.parse(quizIds as string);
  // Call the adminTrashEmpty function with the parsed array'
  const result = adminTrashEmpty(token as string, quizIdsArray);

  if (isErrorMessages(result) &&
    ((result.error === 'Invalid token format.') ||
     (result.error === 'Invalid token: session does not exist.'))) {
    return res.status(httpStatus.UNAUTHORIZED).json(result);
  } else if (isErrorMessages(result) &&
    (result.error === 'Quiz ID is not in the trash.')) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  } else if (isErrorMessages(result) &&
    (result.error === 'Quiz ID does not belong to the current user.')) {
    return res.status(httpStatus.FORBIDDEN).json(result);
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
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
