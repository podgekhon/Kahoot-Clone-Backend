import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  httpStatus,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState,
  requestClear,
  requestAdminGetFinalResults
} from '../src/requestHelperFunctions';
import {
  userAuthRegister,
  tokenReturn,
  quizCreate,
  quizCreateResponse,
  questionCreate,
  startSession,
  quizStartSessionResponse,
  GetFinalResults
} from '../src/interface';
import { adminAction } from '../src/quiz';
// import sleepSync from 'slync';

describe('Test for adminGetFinalResults', () => {
  let user1Response: userAuthRegister;
  let user2Response: userAuthRegister;
  let user1Token: string;
  let user2Token: string;
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
  let adminGetFinalResults: GetFinalResults;

  beforeEach(() => {
    requestClear();
    user1Response = requestAdminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );

    user1Token = (user1Response.body as tokenReturn).token;
    expect(user1Response.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    user2Response = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );

    user2Token = (user2Response.body as tokenReturn).token;
    expect(user1Response.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    quizCreateResponse = requestAdminQuizCreate(
      user1Token,
      'validQuizName',
      'validQuizDescription'
    );
    expect(quizCreateResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
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

    const resStartSession = requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    );
    const sessionState = resStartSession.body.state;
    expect(sessionState).toStrictEqual('LOBBY');
  });

  test.only('User successfully gets final results', () => {
    // player join session

    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, nextQuestionAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, skipCountDownAction);

    // players submit answer question

    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, goFinalResults);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    expect(adminGetFinalResults.body).toStrictEqual({
      usersRankedByScore: [
        {
          playerName: 'player1',
          score: expect.any(Number)
        }
      ],
      questionResults: [
        {
          questionId: expect.any(Number),
          plaeyersCorrect: [
            'player1'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      ]
    });
  });

  test('Return error for invalid SessionId', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, nextQuestionAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, skipCountDownAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, showAnswerAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, goFinalResults);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId + 1,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.BAD_REQUEST
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for session not in FINAL_RESULTS state', () => {
    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.BAD_REQUEST
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for invalid token', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, nextQuestionAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, skipCountDownAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, showAnswerAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, goFinalResults);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user1Token + 1
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.UNAUTHORIZED
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for invalid quizId', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, nextQuestionAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, skipCountDownAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, showAnswerAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, goFinalResults);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId + 1,
      sessionId,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.FORBIDDEN
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for user does not own quiz', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, nextQuestionAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, skipCountDownAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, showAnswerAction);
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, goFinalResults);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user2Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.FORBIDDEN
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });
});
