import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  httpStatus,
  requestPlayerMessage,
  requestPlayerMessageList
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  playerId
} from '../src/interface';

describe('tests for player message list', () => {
  let token: string;
  let quizId: number;
  let quizSessionId: number;
  let playerId: number;
  beforeEach(() => {
    requestClear();
    // register a user
    const user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    token = (user.body as tokenReturn).token;
    // create a quiz
    const quiz = requestAdminQuizCreate(token, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;
    // create a question
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
    // start a quiz session
    const session = requestAdminStartQuizSession(quizId, token, 1);
    quizSessionId = (session.body as quizStartSessionResponse).sessionId;
    // player1 join session
    const player = requestjoinPlayer(quizSessionId, 'Xiaoyuan Ma');
    playerId = (player.body as playerId).playerId;
  });
  test('playerId does not exists', () => {
    const res = requestPlayerMessageList(-1);
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('success case', () => {
    // should be empty at very beginning
    let res = requestPlayerMessageList(playerId);
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(res.body).toStrictEqual({ messages: [] });
    // send a msg to the session
    const message = {
      message: {
        messageBody: 'Hello, im Eric'
      }
    };
    requestPlayerMessage(playerId, message.message);
    const currentTime = Math.floor(Date.now() / 1000);
    res = requestPlayerMessageList(playerId);
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(res.body).toStrictEqual({
      messages: [
        {
          messageBody: 'Hello, im Eric',
          playerId: playerId,
          playerName: 'Xiaoyuan Ma',
          timeSent: expect.any(Number)
        }
      ]
    });
    const timeSent = res.body.messages[0].timeSent;
    expect(timeSent).toBeGreaterThanOrEqual(currentTime - 1);
    expect(timeSent).toBeLessThanOrEqual(currentTime + 1);
  });
});
