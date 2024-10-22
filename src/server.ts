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
  adminQuizDuplicate,
  adminQuizTransfer,
  adminTrashEmpty
} from './quiz';

import { clear } from './other';
import { validateToken, isErrorMessages } from './helperfunction';
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

// adminQuizNameUpdate
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
  } else if ('error' in result) {
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
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

// adminQuizQuestionCreate
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, questionBody } = req.body;

  const result = adminQuizQuestionCreate(
    parseInt(quizid),
    questionBody,
    token
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
        error: 'Valid token is provided, but quiz doesn\'t exist.'
      });
    }

    if (result.error === 'INVALID_OWNER') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but user is not an owner of this quiz'
      });
    }

    if (result.error === 'INVALID_QUESTION_LENGTH') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Question length must be between 5 and 50 characters.'
      });
    }

    if (result.error === 'INVALID_ANSWER_COUNT') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'There must be between 2 and 6 answer options.'
      });
    }

    if (result.error === 'INVALID_TIME_LIMIT') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'The question timeLimit is not a positive number.'
      });
    }

    if (result.error === 'EXCEEDED_TOTAL_TIME_LIMIT') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'The sum of the question timeLimits in the quiz exceeds 3 minutes.'
      });
    }

    if (result.error === 'INVALID_POINTS') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Points must be between 1 and 10.'
      });
    }

    if (result.error === 'INVALID_ANSWER_LENGTH') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Each answer must be between 1 and 30 characters.'
      });
    }

    if (result.error === 'DUPLICATE_ANSWERS') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Duplicate answer options are not allowed.'
      });
    }

    if (result.error === 'NO_CORRECT_ANSWER') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'There must be at least one correct answer.'
      });
    }
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// adminQuizQuestionUpdate
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { quizid, questionid } = req.params;
  const { token, questionBody } = req.body;

  const result = adminQuizQuestionUpdate(
    parseInt(quizid),
    parseInt(questionid),
    questionBody,
    token
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
        error: 'Valid token is provided, but quiz doesn\'t exist.'
      });
    }

    if (result.error === 'INVALID_OWNER') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but user is not an owner of this quiz'
      });
    }

    if (result.error === 'INVALID_QUESTION_ID') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Question Id does not refer to a valid question within this quiz.'
      });
    }

    if (result.error === 'INVALID_QUESTION_LENGTH') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Question length must be between 5 and 50 characters.'
      });
    }

    if (result.error === 'INVALID_ANSWER_COUNT') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'There must be between 2 and 6 answer options.'
      });
    }

    if (result.error === 'INVALID_TIME_LIMIT') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'The question timeLimit is not a positive number.'
      });
    }

    if (result.error === 'EXCEEDED_TOTAL_TIME_LIMIT') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'The sum of the question timeLimits in the quiz exceeds 3 minutes.'
      });
    }

    if (result.error === 'INVALID_POINTS') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Points must be between 1 and 10.'
      });
    }

    if (result.error === 'INVALID_ANSWER_LENGTH') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Each answer must be between 1 and 30 characters.'
      });
    }

    if (result.error === 'DUPLICATE_ANSWERS') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Duplicate answer options are not allowed.'
      });
    }

    if (result.error === 'NO_CORRECT_ANSWER') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'There must be at least one correct answer.'
      });
    }
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
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

  const result = adminQuizInfo(token as string, parseInt(quizid));

  if ('error' in result) {
    if (result.error === 'INVALID_TOKEN') {
      return res.status(httpStatus.UNAUTHORIZED).json({
        error: 'Token is empty or invalid (does not refer to valid logged in user session)'
      });
    }
    if (result.error === 'INVALID_QUIZ') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but the quiz doesn\'t exist.'
      });
    }
    if (result.error === 'INVALID_OWNER') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but user is not the owner of this quiz.'
      });
    }
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// adminQuizRestore
app.post('/v1/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizId as string);
  const validtoken = validateToken(token);
  // invalid token
  if ('error' in validtoken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'token is empty or invalid'
    });
  }

  const result = adminQuizRestore(quizId, token);
  if ('error' in result) {
    if (
      result.error === 'user is not the owner of this quiz' ||
      result.error === 'quiz doesnt exist'
    ) {
      return res.status(httpStatus.FORBIDDEN).json(result);
    }
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }
  return res.json(result);
});

// adminQuizQuestionMove
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { quizid, questionid } = req.params;
  const { token, newPosition } = req.body;

  const result = adminMoveQuizQuestion(parseInt(quizid), parseInt(questionid), token, newPosition);

  if ('error' in result) {
    if (result.error === 'INVALID_TOKEN') {
      return res.status(httpStatus.UNAUTHORIZED).json({
        error: 'Token is empty or invalid (does not refer to valid logged in user session)',
      });
    }
    if (result.error === 'INVALID_QUIZ') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but the quiz doesn\'t exist.',
      });
    }
    if (result.error === 'INVALID_OWNER') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but user is not the owner of this quiz.',
      });
    }
    if (result.error === 'INVALID_QUESTION_ID') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Question Id does not refer to a valid question within this quiz.',
      });
    }
    if (result.error === 'INVALID_POSITION') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'NewPosition is less than 0 or greater than the number of questions.',
      });
    }
    if (result.error === 'SAME_POSITION') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'NewPosition is the same as the current question position.',
      });
    }
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// adminAuthLogout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const validToken = validateToken(token);
  if ('error' in validToken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'Token is empty or invalid'
    });
  }
  const result = adminAuthLogout(token);
  if ('error' in result) {
    if (result.error === 'Session not found.') {
      return res.status(httpStatus.FORBIDDEN).json(result);
    }

    return res.status(httpStatus.BAD_REQUEST).json(result);
  }
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json({});
});

// adminQuizDuplicate
app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizId as string);
  const questionId = parseInt(req.params.questionId as string);
  const validToken = validateToken(token);

  if ('error' in validToken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      error: 'Token is empty or invalid'
    });
  }

  const result = adminQuizDuplicate(quizId, questionId, token);
  if ('error' in result) {
    if (
      result.error === 'quiz does not exist' ||
      result.error === 'user is not owner of this quiz'
    ) {
      return res.status(httpStatus.FORBIDDEN).json(result);
    }
    return res.status(httpStatus.BAD_REQUEST).json(result);
  }
  return res.json(result);
});

// adminQuizQuestionRemove
app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizId as string);
  const questionId = parseInt(req.params.questionId as string);

  const result = adminQuizQuestionRemove(quizId, questionId, token);

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
    if (result.error === 'INVALID_TOKEN') {
      return res.status(httpStatus.UNAUTHORIZED).json({
        error: 'Token is empty or invalid '
      });
    }

    if (result.error === 'INVALID_USEREMAIL') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'email is not registered'
      });
    }
    if (result.error === 'ALREADY_OWNS') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'user currently owns this quiz'
      });
    }
    if (result.error === 'DUPLICATE_QUIZNAME') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'user already has a quiz with the same name'
      });
    }

    if (result.error === 'INVALID_OWNER') {
      return res.status(httpStatus.FORBIDDEN).json({
        error: 'Valid token is provided, but user is not an owner of this quiz'
      });
    }
  }
  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// Empty trash
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const { token, quizIds } = req.query;
  let quizIdsStr = quizIds as string;
  if (!quizIdsStr.startsWith('[')) {
    quizIdsStr = `[${quizIdsStr}]`; // Add brackets if missing
  }
  // Call the adminTrashEmpty function to process the request
  const result = adminTrashEmpty(token as string, quizIdsStr);

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
  } return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
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
