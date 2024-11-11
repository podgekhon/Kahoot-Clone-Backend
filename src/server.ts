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
  adminTrashEmpty,
  adminQuizUpdateThumbnail,
  adminStartQuizSession,
  adminViewQuizSessions,
  adminQuizSessionUpdate,
  adminQuizSessionState
} from './quiz';

import {
  joinPlayer,
  playerAnswerQuestion,
  playerMessage,
  playerState,
  playerMessageList
} from './player';

import { clear } from './other';
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
const requestAdminUserPasswordUpdate = (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  try {
    const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.put('/v1/admin/user/password', requestAdminUserPasswordUpdate);
app.put('/v2/admin/user/password', requestAdminUserPasswordUpdate);

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
const handleAdminQuizNameUpdate = (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { name } = req.body;
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }
  try {
    const result = adminQuizNameUpdate(token, parseInt(quizid), name);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.put('/v1/admin/quiz/:quizid/name', handleAdminQuizNameUpdate);
app.put('/v2/admin/quiz/:quizid/name', handleAdminQuizNameUpdate);

// adminQuizDescriptionUpdate
const handleAdminQuizDescriptionUpdate = (req: Request, res: Response) => {
  const { quizid } = req.params;
  const description = req.body.description;

  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }

  try {
    const result = adminQuizDescriptionUpdate(
      token,
      parseInt(quizid),
      description
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.put('/v1/admin/quiz/:quizid/description', handleAdminQuizDescriptionUpdate);
app.put('/v2/admin/quiz/:quizid/description', handleAdminQuizDescriptionUpdate);

// adminQuizQuestionCreate
function handleQuizQuestionCreate(req: Request, res: Response, version: string) {
  const { quizid } = req.params;
  const { questionBody } = req.body;

  let token;
  if (version === 'v1') {
    token = req.body.token;
  } else {
    token = req.headers.token as string;
  }

  try {
    const result = adminQuizQuestionCreate(
      parseInt(quizid),
      questionBody,
      token,
      version
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
}

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  handleQuizQuestionCreate(req, res, 'v1');
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  handleQuizQuestionCreate(req, res, 'v2');
});

// adminQuizQuestionUpdate
function handleQuizQuestionUpdate(req: Request, res: Response, version: string) {
  const { quizid, questionid } = req.params;
  const { questionBody } = req.body;

  let token;
  if (version === 'v1') {
    token = req.body.token;
  } else {
    token = req.headers.token as string;
  }

  try {
    const result = adminQuizQuestionUpdate(
      parseInt(quizid),
      parseInt(questionid),
      questionBody,
      token,
      version
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
}

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  handleQuizQuestionUpdate(req, res, 'v1');
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  handleQuizQuestionUpdate(req, res, 'v2');
});

// adminUserDetails v1
app.get('/v1/admin/user/details', (req, res) => {
  const { token } = req.query;

  const result = adminUserDetails(token as string);
  if ('error' in result) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: result.error });
  }

  return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
});

// adminUserDetails v2
const handleAdminUserDetails = (req: Request, res: Response) => {
  let token;
  if (req.query.token) {
    token = req.query.token as string;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }
  try {
    const updateResult = adminUserDetails(token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(updateResult);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.get('/v1/admin/user/details', handleAdminUserDetails);
app.get('/v2/admin/user/details', handleAdminUserDetails);

// adminUserDetailsUpdate
const handleAdminUserDetailsUpdate = (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }
  try {
    const updateResult = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(updateResult);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.put('/v1/admin/user/details', handleAdminUserDetailsUpdate);
app.put('/v2/admin/user/details', handleAdminUserDetailsUpdate);

// delete Quiz
const requestAdminQuizRemove = (req: Request, res: Response) => {
  let token;
  if (req.headers.token) {
    token = req.headers.token as string;
  } else if (req.query.token) {
    token = req.query.token as string;
  }
  const { quizid } = req.params;
  try {
    const result = adminQuizRemove(token as string, Number(quizid));
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};
app.delete('/v1/admin/quiz/:quizid', requestAdminQuizRemove);
app.delete('/v2/admin/quiz/:quizid', requestAdminQuizRemove);

// get trash list
const handleAdminTrashList = (req: Request, res: Response) => {
  let token;
  if (req.headers.token) {
    token = req.headers.token as string;
  } else if (req.query.token) {
    token = req.query.token as string;
  }
  try {
    const result = adminTrashList(token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.get('/v1/admin/quiz/trash', handleAdminTrashList);
app.get('/v2/admin/quiz/trash', handleAdminTrashList);

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
const handleAdminQuizInfo = (req: Request, res: Response, version: string) => {
  const { quizid } = req.params;
  let token;
  if (version === 'v1') {
    token = req.query.token;
  } else {
    token = req.headers.token;
  }

  try {
    const result = adminQuizInfo(token as string, parseInt(quizid), version);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
};

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  handleAdminQuizInfo(req, res, 'v1');
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  handleAdminQuizInfo(req, res, 'v2');
});

// adminQuizUpdateThumbnail
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token } = req.headers;
  const { thumbnailUrl } = req.body;

  try {
    const result = adminQuizUpdateThumbnail(parseInt(quizid), token as string, thumbnailUrl);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminQuizRestore
const requestAdminQuizRestore = (req: Request, res: Response) => {
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token;
  }
  const quizId = parseInt(req.params.quizId as string);
  try {
    const result = adminQuizRestore(quizId, token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
};

app.post('/v1/admin/quiz/:quizId/restore', requestAdminQuizRestore);
app.post('/v2/admin/quiz/:quizId/restore', requestAdminQuizRestore);

// adminQuizStartSession
app.post('/v1/admin/quiz/:quizId/session/start', (req, res) => {
  const quizId = parseInt(req.params.quizId as string);
  const token = req.headers.token as string;
  const { autoStartNum } = req.body;

  try {
    const result = adminStartQuizSession(token, quizId, parseInt(autoStartNum));
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminViewQuizSessions
app.get('/v1/admin/quiz/:quizId/sessions', (req, res) => {
  const quizId = parseInt(req.params.quizId as string);
  const token = req.headers.token as string;

  try {
    const result = adminViewQuizSessions(token, quizId);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// adminMoveQuizQuestion
const handleAdminMoveQuizQuestion = (req: Request, res: Response) => {
  const { quizid, questionid } = req.params;
  const { newPosition } = req.body;
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }

  try {
    const result = adminMoveQuizQuestion(
      parseInt(quizid),
      parseInt(questionid),
      token,
      newPosition
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', handleAdminMoveQuizQuestion);
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', handleAdminMoveQuizQuestion);

// adminAuthLogout
const handleadminAuthLogout = (req: Request, res: Response) => {
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }
  try {
    const result = adminAuthLogout(token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.post('/v1/admin/auth/logout', handleadminAuthLogout);
app.post('/v2/admin/auth/logout', handleadminAuthLogout);

// adminQuizQuestionDuplicate
const requestAdminQuizQuestionDuplicate = (req: Request, res: Response) => {
  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  const quizId = parseInt(req.params.quizId as string);
  const questionId = parseInt(req.params.questionId as string);
  try {
    const result = adminQuizQuestionDuplicate(quizId, questionId, token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
};

app.post(
  '/v1/admin/quiz/:quizId/question/:questionId/duplicate',
  requestAdminQuizQuestionDuplicate
);
app.post(
  '/v2/admin/quiz/:quizId/question/:questionId/duplicate',
  requestAdminQuizQuestionDuplicate
);

// adminQuizQuestionRemove
const handleAdminQuizQuestionRemove = (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId as string);
  const questionId = parseInt(req.params.questionId as string);
  let token;
  if (req.query.token) {
    token = req.query.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }
  try {
    const result = adminQuizQuestionRemove(quizId, questionId, token as string);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.delete('/v1/admin/quiz/:quizId/question/:questionId', handleAdminQuizQuestionRemove);
app.delete('/v2/admin/quiz/:quizId/question/:questionId', handleAdminQuizQuestionRemove);

// adminQuizTransfer
const handleAdminQuizTransfer = (
  req: Request,
  res: Response
) => {
  const { quizId } = req.params;
  const { userEmail } = req.body;

  let token;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }

  try {
    const result = adminQuizTransfer(parseInt(quizId), token, userEmail);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (err) {
    const mappedError = errorMap[err.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
};

app.post('/v1/admin/quiz/:quizId/transfer', handleAdminQuizTransfer);

app.post('/v2/admin/quiz/:quizId/transfer', handleAdminQuizTransfer);

const handleAdminTrashEmpty = (req: Request, res: Response) => {
  const { quizIds } = req.query;

  let token;
  if (req.query.token) {
    token = req.query.token;
  } else if (req.headers.token) {
    token = req.headers.token as string;
  }

  try {
    // Parse quizIds into an array of numbers
    const quizIdsArray = JSON.parse(quizIds as string);
    // Call the adminTrashEmpty function with the parsed array'
    const result = adminTrashEmpty(token as string, quizIdsArray);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.delete('/v1/admin/quiz/trash/empty', handleAdminTrashEmpty);
app.delete('/v2/admin/quiz/trash/empty', handleAdminTrashEmpty);

// join player
const handlejoinPlayer = (req: Request, res: Response) => {
  const { sessionId, playerName } = req.body;

  try {
    const result = joinPlayer(sessionId, playerName);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.post('/v1/player/join', handlejoinPlayer);

// quiz session update
app.put('/v1/admin/quiz/:quizId/session/:sessionId', (
  req: Request,
  res: Response
) => {
  const { quizId } = req.params;
  const { sessionId } = req.params;
  const token = req.headers.token as string;
  const { action: actionBody } = req.body;

  // const action = adminAction[actionBody as keyof typeof adminAction];

  try {
    const result = adminQuizSessionUpdate(
      parseInt(quizId),
      parseInt(sessionId),
      token,
      actionBody
    );
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const mappedError = errorMap[error.message];
    return res.status(mappedError.status).json({ error: mappedError.message });
  }
});

// player message
app.post('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const { message } = req.body;

  try {
    const result = playerMessage(playerId, message);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
});

// adminQuizSessionState
const handleadminQuizSessionState = (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const sessionId = parseInt(req.params.sessionId);
  const token = req.headers.token as string;
  try {
    const result = adminQuizSessionState(quizId, sessionId, token);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};
app.get('/v1/admin/quiz/:quizId/session/:sessionId', handleadminQuizSessionState);

// playerState
const handleplayerState = (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  try {
    const result = playerState(playerId);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

// player message list
app.get('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  try {
    const result = playerMessageList(playerId);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
});
app.get('/v1/player/:playerId', handleplayerState);

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (
  req: Request,
  res: Response
) => {
});

// playerAnswerQuestion
const handlePlayerAnswerQuestion = (req: Request, res: Response) => {
  const { answerIds } = req.body;
  // const { playerId, questionPosition } = req.params;
  // const answerIds = req.body.answerIds;
  const playerId = parseInt(req.params.playerId);
  const questionPosition = parseInt(req.params.questionPosition);
  try {
    const result = playerAnswerQuestion(answerIds, playerId, questionPosition);
    return res.status(httpStatus.SUCCESSFUL_REQUEST).json(result);
  } catch (error) {
    const { status, message } = errorMap[error.message];
    return res.status(status).json({ error: message });
  }
};

app.put('/v1/player/:playerId/question/:questionPosition/answer', handlePlayerAnswerQuestion);

// adminGetFinalResults
app.get('')

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
