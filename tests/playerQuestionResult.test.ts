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
  requestAdminQuizInfo,
  requestPlayerQuestionResult
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  playerId,
  quizInfo,
  quizQuestionCreateResponse,
} from '../src/interface';
import { adminAction } from '../src/quiz';
import sleepSync from 'slync';

describe('tests for player question result', () => {
  let usertoken: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;
  let questionId: number;
  beforeEach(() => {
    // clear up everything first
    requestClear();
    // register user
    const user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    usertoken = (user.body as tokenReturn).token;

    // create quiz
    const quiz = requestAdminQuizCreate(usertoken, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;

    const questionBody1 = {
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
      question: 'What is the capital of China?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Beijing', correct: true },
        { answer: 'Shanghai', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    // create quiz question
    const question = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody1);
    questionId = (question.body as quizQuestionCreateResponse).questionId;
    requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody2);

    // start the session
    const session = requestAdminStartQuizSession(quizId, usertoken, 10);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // join player
    const player = requestjoinPlayer(sessionId, 'Eric');
    playerId = (player.body as playerId).playerId;
  });

  test('player Id does not exist', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

    // go to ANSWER_SHOW state
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);

    // get result
    const res = requestPlayerQuestionResult(-1, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid question position', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

    // go to ANSWER_SHOW state
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);

    // get result
    const res = requestPlayerQuestionResult(playerId, -1);
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('session is not in ANSWER_SHOW state', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

    // get result
    const res = requestPlayerQuestionResult(playerId, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('session is not currently on this question', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);
    sleepSync(5000);

    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.SKIP_COUNTDOWN);

    // get result
    const res = requestPlayerQuestionResult(playerId, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('successful case', () => {
    // update state to question_open
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);

    // get answer for question from quizinfo
    const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
    const quizInfo = resQuizInfo.body as quizInfo;
    const answerId = [quizInfo.questions[0].answerOptions[0].answerId];
    // answer question
    const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
    expect(resAnswerQuestion.body).toStrictEqual({ });
    expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // get question result
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    const res = requestPlayerQuestionResult(playerId, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(res.body).toStrictEqual(
      {
        questionId: questionId,
        playersCorrect: [
          'Eric'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 100
      }
    );
  });

  
  test('successful case', () => {
    const player2 = requestjoinPlayer(sessionId, 'eric2');
    const playerId2 = (player2.body as playerId).playerId;
    // update state to question_open
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);

    // get answer for question from quizinfo
    const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
    const quizInfo = resQuizInfo.body as quizInfo;
    const answerId = [quizInfo.questions[0].answerOptions[0].answerId];
    // answer question
    const resAnswerQuestion = requestPlayerAnswerQuestion(answerId, playerId, 1);
    expect(resAnswerQuestion.body).toStrictEqual({ });
    expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    
    const resAnswerQuestion2 = requestPlayerAnswerQuestion(answerId, playerId2, 1);
    expect(resAnswerQuestion2.body).toStrictEqual({ });
    expect(resAnswerQuestion2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);


    // get question result
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    const res = requestPlayerQuestionResult(playerId, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    // expect(res.body).toStrictEqual(
    //   {
    //     questionId: questionId,
    //     playersCorrect: [
    //       'Eric'
    //     ],
    //     averageAnswerTime: expect.any(Number),
    //     percentCorrect: 100
    //   }, {
    //     questionId: questionId,
    //     playersCorrect: [
    //       'Eric'
    //     ],
    //     averageAnswerTime: expect.any(Number),
    //     percentCorrect: 100

    //   }
    // );
  });
});
