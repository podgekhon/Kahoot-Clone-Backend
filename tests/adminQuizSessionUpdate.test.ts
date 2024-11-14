import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  httpStatus,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState,
  requestClear
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
import { adminAction, quizState } from '../src/quiz';
import sleepSync from 'slync';

describe('Test for adminQuizSessionUpdate', () => {
  let user1Response: userAuthRegister;
  let user1Token: string;
  let quizCreateResponse: quizCreate;
  let quizId: number;
  let quizQuestionCreateResponse: questionCreate;
  let startSessionResponse: startSession;
  let sessionId: number;
  const endAction: adminAction = adminAction.END;
  const nextQuestionAction: adminAction = adminAction.NEXT_QUESTION;
  const skipCountDownAction: adminAction = adminAction.SKIP_COUNTDOWN;
  const showAnswerAction: adminAction = adminAction.GO_TO_ANSWER;
  const goFinalResults: adminAction = adminAction.GO_TO_FINAL_RESULT;
  let getUpdatedSession: sessionState;

  let adminQuizSessionUpdate: quizSessionStatusUpdate;

  beforeEach(() => {
    requestClear();
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
      timeLimit: 1,
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
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      endAction
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
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

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

  test.skip('Sucessfully close question', () => {
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    sleepSync(8000);

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.QUESTION_CLOSE);
  });

  test('Sucessfully show answer', () => {
    sleepSync(3000);
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      skipCountDownAction
    );

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
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      skipCountDownAction
    );

    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      showAnswerAction
    );

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

  test('Invalid END action in current state', () => {
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      endAction
    );

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
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

    expect(getUpdatedSession.state).toStrictEqual(quizState.END);
  });

  test('Invalid SKIP_COUNTDOWN action in current state', () => {
    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      skipCountDownAction
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

  test('Invalid ANSWER_SHOW action in current state', () => {
    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      showAnswerAction
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

  test('Invalid NEXT_QUESTION action in current state', () => {
    requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      nextQuestionAction
    );

    expect(adminQuizSessionUpdate.statusCode).toStrictEqual(
      httpStatus.BAD_REQUEST
    );

    getUpdatedSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    ).body;

    expect(getUpdatedSession.state).toStrictEqual(quizState.QUESTION_COUNTDOWN);
  });

  test('Invalid GO_TO_FINAL_RESULTS action in current state', () => {
    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      goFinalResults
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

  test('Invalid admin action', () => {
    const invalidAction = 'INVALID_ACTION';

    adminQuizSessionUpdate = requestAdminQuizSessionUpdate(
      quizId,
      sessionId,
      user1Token,
      (invalidAction as unknown) as adminAction
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

  test('Returns error for invalid sessionId', () => {
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
