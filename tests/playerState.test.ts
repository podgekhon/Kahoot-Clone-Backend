import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  httpStatus,
  requestplayerState
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  playerId
} from '../src/interface';

describe('tests for playerState', () => {
  let token: string;
  let quizId: number;
  let quizSessionId: number;
  let playerId: number;

  beforeEach(() => {
    requestClear();
    const user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    token = (user.body as tokenReturn).token;

    const quiz = requestAdminQuizCreate(token, 'validQuizName', 'validQuizDescription');
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
    requestAdminQuizQuestionCreateV2(quizId, token, questionBody);

    const session = requestAdminStartQuizSession(quizId, token, 1);
    quizSessionId = (session.body as quizStartSessionResponse).sessionId;

    const player = requestjoinPlayer(quizSessionId, 'Guanlin Kong');
    playerId = (player.body as playerId).playerId;
  });

  test('success show player state', () => {
    const resplayerState = requestplayerState(playerId);
    const correctresponse = {
      state: 5,
      numQuestions: 1,
      atQuestion: 1
    };
    expect(resplayerState.body).toStrictEqual(correctresponse);
    expect(resplayerState.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('invalid playerId', () => {
    const resplayerState = requestplayerState(-1);
    expect(resplayerState.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resplayerState.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid playerId2', () => {
    const resplayerState = requestplayerState(123456);
    expect(resplayerState.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resplayerState.body).toStrictEqual({ error: expect.any(String) });
  });
});
