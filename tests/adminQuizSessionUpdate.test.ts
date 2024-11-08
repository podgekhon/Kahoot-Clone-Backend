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
  sessionState,
} from '../src/interface';
// rmb to add quizState
import { adminAction, quizState } from '../src/quiz';
import sleepSync from 'slync';

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
  let getUpdatedSession: sessionState;

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

    // get previous quiz session status to verify future state updates
    const resStartSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    );
    const sessionState = resStartSession.body.state;
    expect(sessionState).toStrictEqual('LOBBY');
  });

  test('User successfully ends session status', () => {
    endAction = adminAction.END;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      adminAction.END
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    const getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    );

    const sesionUpdated = (getUpdatedSession.body as sessionState).state;

    expect(sesionUpdated).toStrictEqual(quizState.END);
  });

  test('User successfully goes to next question', () => {
    nextQuestionAction = adminAction.NEXT_QUESTION;

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.QUESTION_COUNTDOWN);
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

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.QUESTION_OPEN);
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
      skipCountDownAction
    );

    sleepSync(61 * 1000);

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.QUESTION_CLOSE);
  });

  test('Sucessfully show answer', () => {
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

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.FINAL_RESULTS);
  });

  // test('Invalid action in current state')

  test('Returns error for invalid sessionId', () => {
    endAction = adminAction.END;

    const adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId + 1,
      user1Token,
      endAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.BAD_REQUEST
    );

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.LOBBY);
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

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.LOBBY);
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

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.LOBBY);
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

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.LOBBY);
  });
});
