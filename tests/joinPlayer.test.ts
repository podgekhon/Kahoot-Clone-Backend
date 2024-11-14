import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  httpStatus,
  requestadminQuizSessionState,
  requestAdminQuizSessionUpdate
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse
} from '../src/interface';

import {
  adminAction,
  quizState
} from '../src/quiz';

describe('tests for joinplayer', () => {
  let user;
  let userToken: string;
  let quiz;
  let quizId: number;
  let session;
  let sessionId: number;

  beforeEach(() => {
    requestClear();

    user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    userToken = (user.body as tokenReturn).token;

    quiz = requestAdminQuizCreate(userToken, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;

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
    requestAdminQuizQuestionCreateV2(quizId, userToken, questionBody);

    session = requestAdminStartQuizSession(quizId, userToken, 2);
    sessionId = (session.body as quizStartSessionResponse).sessionId;
  });

  test('success join', () => {
    const resStartSession = requestjoinPlayer(sessionId, 'abcde123');
    expect(resStartSession.body).toStrictEqual({ playerId: expect.any(Number) });
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('success join without name', () => {
    const resStartSession = requestjoinPlayer(sessionId, ' ');
    expect(resStartSession.body).toStrictEqual({ playerId: expect.any(Number) });
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('invalid sessionId', () => {
    const resStartSession = requestjoinPlayer(12345678, 'abcde123');
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid name', () => {
    const resStartSession = requestjoinPlayer(sessionId, '.....');
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('join with same name', () => {
    requestjoinPlayer(sessionId, 'abcde123');
    const resStartSession = requestjoinPlayer(sessionId, 'abcde123');
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
    console.log(resStartSession.body);
  });
  test('quiz state not in lobby', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, userToken, adminAction.NEXT_QUESTION);
    const resStartSession = requestjoinPlayer(sessionId, '.....');
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
  });

  test('auto start', () => {
    requestjoinPlayer(sessionId, 'abcde123');
    requestjoinPlayer(sessionId, 'abcde1234');
    const res = requestadminQuizSessionState(quizId, sessionId, userToken);
    expect(res.body).toHaveProperty('state', quizState.QUESTION_COUNTDOWN);
  });
});
