import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  requestPlayerAnswerQuestion,
  requestAdminQuizSessionUpdate,
  requestAdminQuizInfo,
  requestPlayerResults,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  player,
  question,
  quizInfo
} from '../src/interface';

import {
  adminAction
} from '../src/quiz';

import sleepSync from 'slync';

beforeEach(() => {
  requestClear();
});

describe('tests for playerResults', () => {
  let user;
  let usertoken: string;
  let quiz;
  let quizId: number;
  let playerName: string;
  let question;
  let questionId: number;
  let session;
  let sessionId: number;
  let player;
  let playerId: number;
  let questionId2: number;
  beforeEach(() => {
    // register an admin
    user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    usertoken = (user.body as tokenReturn).token;

    // create a quiz
    quiz = requestAdminQuizCreate(usertoken, 'validQuizName', 'validQuizDescription');
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
    const questionBody2 = {
      question: 'What is the largest planet?',
      timeLimit: 5,
      points: 10,
      answerOptions: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/other/image/path.jpg'
    };

    // create a question
    question = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);
    questionId = (question.body as question).questionId;
    const question2 = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody2);
    questionId2 = (question2.body as question).questionId;

    // create a session
    session = requestAdminStartQuizSession(quizId, usertoken, 1);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // join a player
    playerName = 'Eric';
    player = requestjoinPlayer(sessionId, playerName);
    playerId = (player.body as player).playerId;
  });

  test('successfully answer question for 1 player', () => {
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

    // go to final_results
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_FINAL_RESULT);

    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.body).toMatchObject({
      usersRankedByScore: [
        {
          playerName: playerName,
          score: 5
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [
            'Eric'
          ],
          averageAnswerTime: 1,
          percentCorrect: 100
        },
        {
          questionId: questionId2,
          playersCorrect: [],
          averageAnswerTime: 0,
          percentCorrect: 0
        }
      ]
    });

    expect(resultsResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('successfully answer question for multiple players', () => {
    const player2 = requestjoinPlayer(sessionId, 'Patrick');
    const playerId2 = (player2.body as player).playerId;

    const player3 = requestjoinPlayer(sessionId, 'Andrew');
    const playerId3 = (player3.body as player).playerId;

    // update state to question_open
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);

    // get answer for question from quizinfo
    const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
    const quizInfo = resQuizInfo.body as quizInfo;
    const answerId = [quizInfo.questions[0].answerOptions[0].answerId];
    const wrongAnswerId = [quizInfo.questions[0].answerOptions[1].answerId];

    // answer question for player 1
    // time to answer question should start from Q_open
    const resAnswerQuestion1 = requestPlayerAnswerQuestion(answerId, playerId, 1);
    expect(resAnswerQuestion1.body).toStrictEqual({ });
    expect(resAnswerQuestion1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // answer question for player 2
    sleepSync(3000);
    const resAnswerQuestion2 = requestPlayerAnswerQuestion(answerId, playerId2, 1);
    expect(resAnswerQuestion2.body).toStrictEqual({ });
    expect(resAnswerQuestion2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    const resAnswerQuestion3 = requestPlayerAnswerQuestion(wrongAnswerId, playerId3, 1);
    expect(resAnswerQuestion3.body).toStrictEqual({ });
    expect(resAnswerQuestion3.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // go to final_results
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_FINAL_RESULT);

    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.body).toMatchObject({
      usersRankedByScore: [
        {
          playerName: playerName,
          score: 5
        },
        {
          playerName: 'Patrick',
          score: 3
        },
        {
          playerName: 'Andrew',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [
            'Eric',
            'Patrick'
          ],
          averageAnswerTime: 3,
          percentCorrect: 67
        },
        {
          questionId: questionId2,
          playersCorrect: [],
          averageAnswerTime: 0,
          percentCorrect: 0
        }

      ]
    });

    expect(resultsResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('successfully answer multiple questions correctly for one player', () => {
    const player2 = requestjoinPlayer(sessionId, 'Andrew');
    const playerId2 = (player2.body as player).playerId;

    // Answer first question
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);

    const resQuizInfo1 = requestAdminQuizInfo(quizId, usertoken);
    const quizInfo1 = resQuizInfo1.body as quizInfo;
    const answerId1 = [quizInfo1.questions[0].answerOptions[0].answerId];

    const resAnswerQuestion1 = requestPlayerAnswerQuestion(answerId1, playerId, 1);
    expect(resAnswerQuestion1.body).toStrictEqual({});
    expect(resAnswerQuestion1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);

    const resQuizInfo2 = requestAdminQuizInfo(quizId, usertoken);
    const quizInfo2 = resQuizInfo2.body as quizInfo;
    const answerId2 = [quizInfo2.questions[1].answerOptions[0].answerId];

    // Answer second question
    const resAnswerQuestion2 = requestPlayerAnswerQuestion(answerId2, playerId, 2);
    expect(resAnswerQuestion2.body).toStrictEqual({});
    expect(resAnswerQuestion2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    sleepSync(3000);

    const resAnswerQuestion3 = requestPlayerAnswerQuestion(answerId2, playerId2, 2);
    expect(resAnswerQuestion3.body).toStrictEqual({});
    expect(resAnswerQuestion3.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // Go to final_results
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_FINAL_RESULT);

    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.body).toMatchObject({
      usersRankedByScore: [
        {
          playerName: 'Eric',
          score: 15
        },
        {
          playerName: 'Andrew',
          score: 5
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: ['Eric'],
          averageAnswerTime: 1,
          percentCorrect: 50
        },
        {
          questionId: questionId2,
          playersCorrect: ['Andrew', 'Eric'],
          averageAnswerTime: 3,
          percentCorrect: 100
        }
      ]
    });

    expect(resultsResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('answer question incorrectly for one player', () => {
    // Update state to question_open
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.NEXT_QUESTION);
    sleepSync(4000);

    // Get the incorrect answer ID for the question
    const resQuizInfo = requestAdminQuizInfo(quizId, usertoken);
    const quizInfo = resQuizInfo.body as quizInfo;
    const incorrectAnswerId = [quizInfo.questions[0].answerOptions[1].answerId];

    // Player answers the question incorrectly
    const resAnswerQuestion = requestPlayerAnswerQuestion(incorrectAnswerId, playerId, 1);
    expect(resAnswerQuestion.body).toStrictEqual({});
    expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // Go to final_results
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_ANSWER);
    requestAdminQuizSessionUpdate(quizId, sessionId, usertoken, adminAction.GO_TO_FINAL_RESULT);

    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.body).toMatchObject({
      usersRankedByScore: [
        {
          playerName: 'Eric',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [],
          averageAnswerTime: 1,
          percentCorrect: 0
        },
        {
          questionId: questionId2,
          playersCorrect: [],
          averageAnswerTime: 0,
          percentCorrect: 0
        }

      ]
    });

    expect(resultsResponse.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('should return BAD_REQUEST if player ID does not exist', () => {
    // Attempt to get results for a non-existent player
    const resultsResponse = requestPlayerResults(999);
    expect(resultsResponse.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(resultsResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('should return BAD_REQUEST if session is not in FINAL_RESULTS state', () => {
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

    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(resultsResponse.body).toStrictEqual({ error: expect.any(String) });
  });
});
