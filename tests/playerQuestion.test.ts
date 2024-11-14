import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  requestPlayerQuestion,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState,
  httpStatus,
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  playerId,
  quizQuestionCreateResponse,
  question,
  sessionState
} from '../src/interface';
import { adminAction, quizState } from '../src/quiz';
import sleepSync from 'slync';

beforeEach(() => {
  requestClear();
});

describe('tests for playerQuestion', () => {
  let user;
  let usertoken: string;
  let quiz;
  let quizId: number;
  let session;
  let sessionId: number;
  let question;
  let questionId: number;
  let questionBody: question;
  let question2;
  let questionId2: number;
  let questionBody2: question;
  let player;
  let playerId: number;

  beforeEach(() => {
    // register a authuser
    user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    usertoken = (user.body as tokenReturn).token;

    // create a quiz
    quiz = requestAdminQuizCreate(usertoken, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;

    // create question
    questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 1,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);
    questionId = (question.body as quizQuestionCreateResponse).questionId;

    questionBody2 = {
      question: 'What is the capital of China?',
      timeLimit: 1,
      points: 5,
      answerOptions: [
        { answer: 'Beijing', correct: true },
        { answer: 'Shanghai', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question2 = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody2);
    questionId2 = (question2.body as quizQuestionCreateResponse).questionId;

    // start quiz session - copys it so changes is not affected on active quiz
    session = requestAdminStartQuizSession(quizId, usertoken, 10);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // add a player
    player = requestjoinPlayer(sessionId, 'abcde123');
    playerId = (player.body as playerId).playerId;
  });

  describe('valid cases', () => {
    test('successfully get question when session state is QUESTION_OPEN', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      const positionResponse = requestPlayerQuestion(playerId, 1);

      expect(positionResponse.body).toMatchObject({
        questionId: questionId,
        question: questionBody.question,
        timeLimit: questionBody.timeLimit,
        thumbnailUrl: questionBody.thumbnailUrl,
        points: questionBody.points,
      });

      expect(positionResponse.body.answerOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[0].answer,
            colour: expect.any(String),
          }),
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[1].answer,
            colour: expect.any(String),
          }),
        ])
      );
    });

    test('successfully get question at different positions', () => {
      // open question 1
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      // check if state is question_open
      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      // request question at position 1
      const positionResponse = requestPlayerQuestion(playerId, 1);
      expect(positionResponse.body).toMatchObject({
        questionId: questionId,
        question: questionBody.question,
        timeLimit: questionBody.timeLimit,
        thumbnailUrl: questionBody.thumbnailUrl,
        points: questionBody.points,
      });

      // check question
      expect(positionResponse.body.answerOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[0].answer,
            colour: expect.any(String),
          }),
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[1].answer,
            colour: expect.any(String),
          }),
        ])
      );
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

      // go to question 2
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

      // check if state is question_open
      const quizSession2 = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus2 = (quizSession2.body as sessionState).state;
      expect(quizSessionStatus2).toStrictEqual(quizState.QUESTION_OPEN);

      // get question at position 2
      const positionResponse2 = requestPlayerQuestion(playerId, 2);
      expect(positionResponse2.body).toMatchObject({
        questionId: questionId2,
        question: questionBody2.question,
        timeLimit: questionBody2.timeLimit,
        thumbnailUrl: questionBody2.thumbnailUrl,
        points: questionBody2.points,
      });

      expect(positionResponse2.body.answerOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody2.answerOptions[0].answer,
            colour: expect.any(String),
          }),
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody2.answerOptions[1].answer,
            colour: expect.any(String),
          }),
        ])
      );

      expect(positionResponse2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    });

    test('successfully get question in when session state is QUESTION_CLOSE', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      sleepSync(5000);
      const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      const quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_CLOSE);

      const positionResponse = requestPlayerQuestion(playerId, 1);
      expect(positionResponse.body).toMatchObject({
        questionId: questionId,
        question: questionBody.question,
        timeLimit: questionBody.timeLimit,
        thumbnailUrl: questionBody.thumbnailUrl,
        points: questionBody.points,
      });

      expect(positionResponse.body.answerOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[0].answer,
            colour: expect.any(String),
          }),
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[1].answer,
            colour: expect.any(String),
          }),
        ])
      );
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    });

    test('successfully get question in when session state is ANSWER_SHOW', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      let quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      let quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
      const positionResponse = requestPlayerQuestion(playerId, 1);

      quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
      quizSessionStatus = (quizSession.body as sessionState).state;
      expect(quizSessionStatus).toStrictEqual(quizState.ANSWER_SHOW);

      expect(positionResponse.body).toMatchObject({
        questionId: questionId,
        question: questionBody.question,
        timeLimit: questionBody.timeLimit,
        thumbnailUrl: questionBody.thumbnailUrl,
        points: questionBody.points,
      });

      expect(positionResponse.body.answerOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[0].answer,
            colour: expect.any(String),
          }),
          expect.objectContaining({
            answerId: expect.any(Number),
            answer: questionBody.answerOptions[1].answer,
            colour: expect.any(String),
          }),
        ])
      );
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    });
  });

  describe('error testing', () => {
    test('Invalid playerId', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      const invalidPlayerId = 9999;
      const positionResponse = requestPlayerQuestion(invalidPlayerId, 1);

      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Question position is not valid for the session this player is in', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      const positionResponse = requestPlayerQuestion(playerId, 9999);

      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Question position is not valid when session state is LOBBY', () => {
      // session state is LOBBY
      const positionResponse = requestPlayerQuestion(playerId, 1);
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Question position is not valid when session state is QUESTION_COUNTDOWN', () => {
      // session state is QUESTION_COUNTDOWN
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      const positionResponse = requestPlayerQuestion(playerId, 1);
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Question position is not valid when session state is FINAL_RESULT', () => {
      // sesstion state is FINAL_RESULT
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_FINAL_RESULTS);
      const positionResponse = requestPlayerQuestion(playerId, 1);
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Question position is not valid when session state is END_STATE', () => {
      // session state is END_STATE
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.END);
      const positionResponse = requestPlayerQuestion(playerId, 1);
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Session is not currently on this question', () => {
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
      requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
      const positionResponse = requestPlayerQuestion(playerId, 2);
      expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
      expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    });
  });
});
