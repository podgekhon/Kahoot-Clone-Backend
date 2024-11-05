import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  httpStatus,
  requestAdminQuizSessionUpdate
} from '../src/requestHelperFunctions';
import {
  userAuthRegister,
  tokenReturn,
  quizCreate,
  quizCreateResponse,
  questionCreate,
  startSession,
  quizStartSessionResponse,
  quizSessionStatusUpdate,
} from '../src/interface';

import { quizState, adminAction } from '../src/quiz';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

const testCasePairs = [
  {
    action: adminAction.END,
    sessionState: quizState.END
  },
  {
    action: adminAction.GO_TO_FINAL_RESULT,
    sessionState: quizState.FINAL_RESULTS
  },
  {
    action: adminAction.GO_TO_ANSWER,
    sessionState: quizState.ANSWER_SHOW
  },
  {
    action: adminAction.NEXT_QUESTION,
    sessionState: quizState.QUESTION_COUNTDOWN
  },
  {
    action: adminAction.SKIP_COUNTDOWN,
    sessionState: quizState.QUESTION_OPEN
  },
];

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Test for adminQuizSessionUpdate', () => {
  let user1Response: userAuthRegister;
  let user1Token: string;
  let quizCreateResponse: quizCreate;
  let quizId: number;
  let quizQuestionCreateResponse: questionCreate;
  let startSessionResponse: startSession;
  let sessionId: number;
  let actionBody: object; // this might change to use a proper enum
  let adminQuizSessionUpdate: quizSessionStatusUpdate;

  beforeEach(() => {
    user1Response = requestAdminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );

    user1Token = (user1Response.body as tokenReturn).token;
    expect(user1Response.statusCode).toStrictEqual(200);

    quizCreateResponse = requestAdminQuizCreate(
      user1Token,
      'validQuizName',
      'validQuizDescription'
    );
    expect(quizCreateResponse.statusCode).toStrictEqual(200);
    quizId = (quizCreateResponse.body as quizCreateResponse).quizId;

    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    quizQuestionCreateResponse = requestAdminQuizQuestionCreateV2(
      quizId,
      user1Token,
      questionBody
    );
    expect(quizQuestionCreateResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    startSessionResponse = requestAdminStartQuizSession(
      quizId,
      user1Token,
      1
    );
    expect(startSessionResponse.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    sessionId = (
      startSessionResponse.body as quizStartSessionResponse
    ).sessionId;

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });

  // i can use for.each and assign actions and status and just loop thru
  test.each(testCasePairs)('All actions & status successful', ({
    action,
    sessionState
  }) => {
    actionBody = { action: action };

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      actionBody
    );

    expect(adminQuizSessionUpdate).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual(sessionState);
  });

  test('Returns error for invalid sessionId', () => { // use test.each for all 400 errs
    actionBody = { action: 'END' };

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      actionBody
    );

    expect(adminQuizSessionUpdate).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });

  test('Returns error for invalid token', () => {
    actionBody = { action: 'END' };

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      'invalidToken',
      actionBody
    );

    expect(adminQuizSessionUpdate).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });

  test('Returns error for invalid quizId', () => { // loop thru
    actionBody = { action: 'END' };

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId + 1,
      sessionId,
      user1Token,
      actionBody
    );

    expect(adminQuizSessionUpdate).toStrictEqual(
      httpStatus.FORBIDDEN
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });

  test('Returns error for user is not owner of quiz', () => {
    const user2Response: userAuthRegister = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );
    expect(user2Response.statusCode).toStrictEqual(200);
    const user2Token: string = (user2Response.body as tokenReturn).token;

    actionBody = { action: 'END' };

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user2Token,
      actionBody
    );

    expect(adminQuizSessionUpdate).toStrictEqual(
      httpStatus.FORBIDDEN
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });
});
