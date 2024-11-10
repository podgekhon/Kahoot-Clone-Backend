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
  // let question2;
  // let questionId2: number;
  // let questionBody2: question;
  let question3;
  let questionId3: number;
  let questionBody3: question;
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
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);
    questionId = (question.body as quizQuestionCreateResponse).questionId;

    const questionBody2 = {
      question: 'What is the capital of China?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Beijing', correct: true },
        { answer: 'Shanghai', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody2);
    // questionId2 = (question2.body as quizQuestionCreateResponse).questionId;

    questionBody3 = {
      question: 'What is the capital of USA?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Washington', correct: true },
        { answer: 'New York', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question3 = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody3);
    questionId3 = (question3.body as quizQuestionCreateResponse).questionId;

    // start quiz session - copys it so changes is not affected on active quiz
    session = requestAdminStartQuizSession(quizId, usertoken, 1);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // add a player
    player = requestjoinPlayer(sessionId, 'abcde123');
    playerId = (player.body as playerId).playerId;
  });

  test('successfully get question when session state is QUESTION_OPEN', () => {
    // state must be QUESTION_OPEN / QUESTION_CLOSE / ANSWER_SHOW
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4 * 1000);

    const quizSession = requestadminQuizSessionState(quizId, sessionId, usertoken);
    const quizSessionStatus = (quizSession.body as sessionState).state;
    expect(quizSessionStatus).toStrictEqual(quizState.QUESTION_OPEN);

    const questionPosition = 1;
    const positionResponse = requestPlayerQuestion(playerId, questionPosition);

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
    // state must be QUESTION_OPEN / QUESTION_CLOSE / ANSWER_SHOW
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4 * 1000);

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
    expect(positionResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4 * 1000);

    const quizSession2 = requestadminQuizSessionState(quizId, sessionId, usertoken);
    const quizSessionStatus2 = (quizSession2.body as sessionState).state;
    expect(quizSessionStatus2).toStrictEqual(quizState.QUESTION_OPEN);

    const positionResponse2 = requestPlayerQuestion(9999, 2);
    expect(positionResponse2.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(positionResponse2.body).toStrictEqual({ error: expect.any(String) });

    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4 * 1000);

    const quizSession3 = requestadminQuizSessionState(quizId, sessionId, usertoken);
    const quizSessionStatus3 = (quizSession3.body as sessionState).state;
    expect(quizSessionStatus3).toStrictEqual(quizState.QUESTION_OPEN);

    const positionResponse3 = requestPlayerQuestion(playerId, 3);

    expect(positionResponse3.body).toMatchObject({
      questionId: questionId3,
      question: questionBody3.question,
      timeLimit: questionBody3.timeLimit,
      thumbnailUrl: questionBody3.thumbnailUrl,
      points: questionBody3.points,
    });

    expect(positionResponse3.body.answerOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: questionBody3.answerOptions[0].answer,
          colour: expect.any(String),
        }),
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: questionBody3.answerOptions[1].answer,
          colour: expect.any(String),
        }),
      ])
    );

    expect(positionResponse3.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('successfully get question in when session state is QUESTION_CLOSE', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
    sleepSync(61 * 1000);
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
    sleepSync(4000);
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

  test('Invalid playerId', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);
    const invalidPlayerId = 9999;
    const positionResponse = requestPlayerQuestion(invalidPlayerId, 1);

    expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    // console.log(`error = ${JSON.stringify(positionResponse.body)}`);
    expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Question position is not valid for the session this player is in', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);
    const positionResponse = requestPlayerQuestion(playerId, 9999);

    expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    // console.log(`error = ${JSON.stringify(positionResponse.body)}`);
    expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Question position is not valid when session state is LOBBY', () => {
    // session state is LOBBY
    const positionResponse = requestPlayerQuestion(playerId, 1);
    expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    // console.log(`error = ${JSON.stringify(positionResponse.body)}`);
    expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Question position is not valid when session state is QUESTION_COUNTDOWN', () => {
    // session state is QUESTION_COUNTDOWN
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    const positionResponse = requestPlayerQuestion(playerId, 1);
    expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    // console.log(`error = ${JSON.stringify(positionResponse.body)}`);
    expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Question position is not valid when session state is FINAL_RESULT', () => {
    // sesstion state is FINAL_RESULT
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_FINAL_RESULT);
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

    const positionResponse = requestPlayerQuestion(playerId, 2);
    // console.log(`error = ${JSON.stringify(positionResponse.body)}`);
    expect(positionResponse.body).toStrictEqual({ error: expect.any(String) });
    expect(positionResponse.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });
});
