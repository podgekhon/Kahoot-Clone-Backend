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

describe('tests for player message send', () => {
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

    const session = requestAdminStartQuizSession(quizId, token, 10);
    quizSessionId = (session.body as quizStartSessionResponse).sessionId;

    const player = requestjoinPlayer(quizSessionId, 'Xiaoyuan ma');
    playerId = (player.body as playerId).playerId;
  });
  describe('valid tests', () => {
    test('successfully send the message', () => {
      const messageToSend = {
        message: {
          messageBody: 'hello guys'
        }
      };
      const res = requestPlayerMessage(playerId, messageToSend.message);
      // correct return type
      expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(res.body).toStrictEqual({});

      // get the message list
      const msgList = requestPlayerMessageList(playerId);
      expect(msgList.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(msgList.body).toStrictEqual({
        messages: [
          {
            messageBody: 'hello guys',
            playerId: playerId,
            playerName: 'Xiaoyuan ma',
            timeSent: expect.any(Number)
          }
        ]
      });
    });
  });

  describe('invalid tests', () => {
    test('player ID does not exists', () => {
      const messageToSend = {
        message: {
          messageBody: 'No player Id'
        }
      };
      const res = requestPlayerMessage(-1, messageToSend.message);
      expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
    });

    describe('invalid message body', () => {
      test('message too short', () => {
        const messageToSend = {
          message: {
            messageBody: ''
          }
        };
        const res = requestPlayerMessage(playerId, messageToSend.message);
        expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });

      test('message too long', () => {
        const messageToSend = {
          message: {
            messageBody:
  'asdfasdfjklasfdjklsafjkdlsa;jfdklsagdjksaljgkldsajkfl' +
  'fdsafjieowajgnklewjakljelfwjaiofejiwogjeiowjaoijfioejwao'
          }
        };
        const res = requestPlayerMessage(playerId, messageToSend.message);
        expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
        expect(res.body).toStrictEqual({ error: expect.any(String) });
      });
    });
  });
});
