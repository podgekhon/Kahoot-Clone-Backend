import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  httpStatus,
  requestadminQuizSessionState,
  requestAdminQuizUpdateThumbnail
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse
} from '../src/interface';

import {
  quizState
} from '../src/quiz';

describe('tests for adminQuizSession', () => {
  let user;
  let usertoken: string;
  let quiz;
  let quizId: number;
  let session;
  let sessionId: number;

  beforeEach(() => {
    requestClear();

    user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    usertoken = (user.body as tokenReturn).token;

    quiz = requestAdminQuizCreate(usertoken, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;

    const newThumbnailUrl = 'http://google.com/some/image/path.jpg';
    requestAdminQuizUpdateThumbnail(quizId, usertoken, newThumbnailUrl);

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
    requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);

    session = requestAdminStartQuizSession(quizId, usertoken, 10);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    requestjoinPlayer(sessionId, 'abcde123');
  });

  test('success Show Session State', () => {
    const resStartSession = requestadminQuizSessionState(quizId, sessionId, usertoken);

    expect(resStartSession.body).toStrictEqual({
      state: quizState.LOBBY,
      atQuestion: 1,
      players: [
        'abcde123'
      ],
      metadata: {
        quizId: expect.any(Number),
        name: 'validQuizName',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'validQuizDescription',
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'What is the capital of Australia?',
            timeLimit: 4,
            thumbnailUrl: 'http://google.com/some/image/path.jpg',
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'Canberra',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Sydney',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: 4,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
    );
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('Invalid SessionId', () => {
    const resStartSession = requestadminQuizSessionState(quizId, -1, usertoken);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('Invalid Token', () => {
    const resStartSession = requestadminQuizSessionState(quizId, sessionId, '-1');
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = requestAdminAuthRegister('user2@gmail.com', 'validPassword5', 'User', 'Two');
    const user2token = (user2.body as tokenReturn).token;

    const resStartSession = requestadminQuizSessionState(quizId, sessionId, user2token);
    expect(resStartSession.body).toStrictEqual({ error: expect.any(String) });
    expect(resStartSession.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
  });
});
