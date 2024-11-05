import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  playerId
} from '../src/interface';

beforeEach(() => {
  requestClear();
});

/*
Allow the current player to submit answer(s) to the currently active question. Question position starts at 1
Note: An answer can be re-submitted once first selection is made, as long as game is in the right state
*/
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
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    // create quiz question
    requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);

    // start the session
    session = requestAdminStartQuizSession(quizId, usertoken, 1);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // join player
    player = requestjoinPlayer(sessionId, 'Eric');
    playerId = (player.body as playerId).playerId;

  });

  test('success join', () => {
    const answer = { "answerIds": [2384] };
    const resAnswerQuestion = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(resAnswerQuestion.body).toStrictEqual({ });
    expect(resAnswerQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('valid answer re-submission', () => {
    const answer = { answerIds: [2384] };
    requestPlayerAnswerQuestion(answer, playerId, 1);
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('non-existent player ID', () => {
    const answer = { answerIds: [2384] };
    const res = requestPlayerAnswerQuestion(answer, 9999, 1);
    expect(res.body.error).toBe('EXIST_PLAYERID');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('invalid question position', () => {
    const answer = { answerIds: [2384] };
    const res = requestPlayerAnswerQuestion(answer, playerId, 99);
    expect(res.body.error).toBe('INVALID_QUESTION_POSITION');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('session not in QUESTION_OPEN state', () => {
    session.sessionState = 'LOBBY'; // Change session state to a non-QUESTION_OPEN state
    const answer = { answerIds: [2384] };
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.body.error).toBe('SESSION_NOT_IN_QUESTION_OPEN');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('inactive question in session', () => {
    const answer = { answerIds: [2384] };
    const res = requestPlayerAnswerQuestion(answer, playerId, 2); // Use a different question position
    expect(res.body.error).toBe('SESSION_NOT_CURRENT_QUESTION');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('invalid answer IDs for question', () => {
    const answer = { answerIds: [9999] }; // Non-existent answer ID
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.body.error).toBe('INVALID_ANSWER_IDS');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('duplicate answer IDs provided', () => {
    const answer = { answerIds: [2384, 2384] }; // Duplicate answer ID
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.body.error).toBe('DUPLICATE_ANSWER_IDS');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('no answer IDs submitted', () => {
    const answer = { answerIds: [] }; // Empty answer IDs
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.body.error).toBe('NO_ANSWER_IDS');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('multiple players submitting for the same question', () => {
    const secondPlayer = requestjoinPlayer(sessionId, 'Alex');
    const secondPlayerId = (secondPlayer.body as playerId).playerId;

    const answer = { answerIds: [2384] };
    const res1 = requestPlayerAnswerQuestion(answer, playerId, 1);
    const res2 = requestPlayerAnswerQuestion(answer, secondPlayerId, 1);

    expect(res1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    expect(res2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('sequential question answering by same player', () => {
    const answer1 = { answerIds: [2384] };
    const answer2 = { answerIds: [2385] };

    // Answer question 1
    const res1 = requestPlayerAnswerQuestion(answer1, playerId, 1);
    expect(res1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);

    // Transition to the next question (assuming session can progress programmatically here)
    session.sessionState = 'QUESTION_OPEN';

    // Answer question 2
    const res2 = requestPlayerAnswerQuestion(answer2, playerId, 2);
    expect(res2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('answer after session state transitions out of QUESTION_OPEN', () => {
    const answer = { answerIds: [2384] };
    requestPlayerAnswerQuestion(answer, playerId, 1);

    // Change session state after first answer
    session.sessionState = 'LOBBY';

    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.body.error).toBe('SESSION_NOT_IN_QUESTION_OPEN');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('multiple correct answer options submission', () => {
    const answer = { answerIds: [2384, 2385] }; // Assume both are correct for this case
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('inactive player submitting answer', () => {
    const inactivePlayerId = playerId + 1; // Assume a player who hasn’t joined the session
    const answer = { answerIds: [2384] };
    const res = requestPlayerAnswerQuestion(answer, inactivePlayerId, 1);
    expect(res.body.error).toBe('EXIST_PLAYERID');
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
  });

  test('extra fields in request body (ignored)', () => {
    const answer = { answerIds: [2384], irrelevantField: 'extra data' }; // Extra field
    const res = requestPlayerAnswerQuestion(answer, playerId, 1);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });  
});
