import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  requestPlayerAnswerQuestion,
  httpStatus,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState,
  requestAdminQuizInfo
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  playerId,
  sessionState,
  quizInfo
} from '../src/interface';
import { adminAction, quizState } from '../src/quiz';

beforeEach(() => {
  requestClear();
});

describe('tests for playerAnswerQuestion', () => {
  let user;
  let usertoken: string;
  let quiz;
  let quizId: number;
  let session;
  let sessionId: number;
  let player;
  let playerId: number;

  beforeEach(() => {
    // register user
    user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    usertoken = (user.body as tokenReturn).token;

    // create quiz
    quiz = requestAdminQuizCreate(usertoken, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;

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
    const questionBody2 = {
      question: 'What is the capital of Australia?',
      timeLimit: 1,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    // create quiz question
    requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);
    requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody2);

    // start the session
    session = requestAdminStartQuizSession(quizId, usertoken, 10);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // join player
    player = requestjoinPlayer(sessionId, 'Eric');
    playerId = (player.body as playerId).playerId;
  });

  describe('valid tests', () => {
    test('successfully answer question', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
      expect(resAnswerQuestion.body).toStrictEqual({ });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    });

    describe('invalid tests', () => {
      test('valid answer re-submission', () => {
        requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
        requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

        const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
        const quizInfo = resQuizInfo.body as quizInfo;
        const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

        const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
        const quizSessionStatus = (quizSession.body as sessionState).state;
        expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);
        requestPlayerAnswerQuestion(answerId, playerId, 1);
        const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
        expect(resAnswerQuestion.body).toStrictEqual({ });
        expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      });
    });

    test('non-existent player ID', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);
      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, 9999, 1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('invalid question position', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);
      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, -1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('session not in QUESTION_OPEN state', () => {
      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('inactive question in session', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, -1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('invalid answer IDs for question', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      const answerId = [999];

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('duplicate answer IDs provided', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId,
        quizInfo.questions[0].answerOptions[0].answerId];

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('no answer IDs submitted', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const answerId: number[] = [];
      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });

    test('session not on question', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);

      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
      const quizInfo = resQuizInfo.body as quizInfo;
      const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

      const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
      console.log(`resAnswerQuestion.body = ${JSON.stringify(resAnswerQuestion.body)}`);
      expect(resAnswerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });
  });
});
