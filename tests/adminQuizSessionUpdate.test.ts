import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  httpStatus,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState
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
  sessionState
} from '../src/interface';
import sleepSync from 'slync';

// rmb to add quizState
import { adminAction, quizState } from '../src/quiz';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

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
  let endAction: adminAction;
  let nextQuestionAction: adminAction;
  let skipCountDownAction: adminAction;
  let showAnswerAction: adminAction;
  let goFinalResults: adminAction;

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

  test('User successfully ends session status', () => {
    endAction = adminAction.END;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      endAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual(quizState.END);
  });

  test.only('User successfully goes to next question', () => {
    nextQuestionAction = adminAction.NEXT_QUESTION;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );
    
    sleepSync(4 * 1000);

    console.log(expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    ));
  

    // get quiz session status to verify changes made to status
    const quizSession = requestadminQuizSessionState(quizId, sessionId, user1Token);
    const quizSessionStatus = (quizSession.body as sessionState).state;
    expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);
  });

  test('User successfully skips countdown', () => {
    nextQuestionAction = adminAction.NEXT_QUESTION;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    skipCountDownAction = adminAction.SKIP_COUNTDOWN;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      skipCountDownAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('quizState.QUESTION_OPEN');
  });

  test('Sucessfully close question', () => {
    nextQuestionAction = adminAction.NEXT_QUESTION;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    skipCountDownAction = adminAction.SKIP_COUNTDOWN;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      showAnswerAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
  // get quiz session status to verify changes made to status
  // const quizSession = getQuizSession(quizId, sessionId, user1Token);
  // const quizSessionStatus = (quizSession.body as getQuizSession).status;
  // expect(quizSessionStatus).toStrictEqual('quizState.QUESTION_CLOSE');
  });

  test('Sucessfully show answer', () => {
    nextQuestionAction = adminAction.NEXT_QUESTION; // figure out how to do this

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    skipCountDownAction = adminAction.SKIP_COUNTDOWN;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      skipCountDownAction
    );

    showAnswerAction = adminAction.GO_TO_ANSWER;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      showAnswerAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
  });

  // test for invalid action in current state

  test('Sucessfully go to final results', () => {
    nextQuestionAction = adminAction.NEXT_QUESTION;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    skipCountDownAction = adminAction.SKIP_COUNTDOWN;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      skipCountDownAction
    );

    showAnswerAction = adminAction.GO_TO_ANSWER;

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      showAnswerAction
    );

    goFinalResults = adminAction.GO_TO_FINAL_RESULT;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      goFinalResults
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
  // get quiz session status to verify changes made to status
  // const quizSession = getQuizSession(quizId, sessionId, user1Token);
  // const quizSessionStatus = (quizSession.body as getQuizSession).status;
  // expect(quizSessionStatus).toStrictEqual('quizState.QUESTION_CLOSE');
  });

  test('Returns error for invalid sessionId', () => { // use test.each for all 400 errs
    endAction = adminAction.END;

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      endAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    // get quiz session status to verify changes made to status
    // const quizSession = getQuizSession(quizId, sessionId, user1Token);
    // const quizSessionStatus = (quizSession.body as getQuizSession).status;
    // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });

  test('Returns error for invalid token', () => {
    endAction = adminAction.END;

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      'invalidToken',
      endAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.UNAUTHORIZED
    );

  // get quiz session status to verify changes made to status
  // const quizSession = getQuizSession(quizId, sessionId, user1Token);
  // const quizSessionStatus = (quizSession.body as getQuizSession).status;
  // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });

  test('Returns error for invalid quizId', () => { // loop thru
    endAction = adminAction.END;
    const invalidQuizId = -1;

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      invalidQuizId,
      sessionId,
      user1Token,
      endAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
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

    endAction = adminAction.END;

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user2Token,
      endAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.FORBIDDEN
    );

  // get quiz session status to verify changes made to status
  // const quizSession = getQuizSession(quizId, sessionId, user1Token);
  // const quizSessionStatus = (quizSession.body as getQuizSession).status;
  // expect(quizSessionStatus).toStrictEqual('LOBBY');
  });
});
