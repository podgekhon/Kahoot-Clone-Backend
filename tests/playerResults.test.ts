import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  requestClear,
  requestjoinPlayer,
  requestPlayerAnswerQuestion,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizStartSessionResponse,
  player,
  question
} from '../src/interface';

beforeEach(() => {
  requestClear();
});

describe('tests for joinplayer', () => {
  let user;
  let usertoken: string;
  let quiz;
  let quizId: number;
  let playerName: string;
  let question;
  let questionId;
  let session;
  let sessionId: number;
  let player;
  let playerId: number;

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
    // create a question
    question = requestAdminQuizQuestionCreateV2(quizId, usertoken, questionBody);
    questionId = (question.body as question).questionId;

    // create a session
    session = requestAdminStartQuizSession(quizId, usertoken, 1);
    sessionId = (session.body as quizStartSessionResponse).sessionId;

    // join a player
    playerName = 'Eric'
    player = requestjoinPlayer(sessionId, playerName);
    playerId = (player.body as player).playerId;

    requestPlayerAnswerQuestion([2384], playerId, 1);

  });

  test('success join', () => {
    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.body).toMatchObject
    ({
        usersRankedByScore: [
          {
            playerName: playerName,
            score: 45
          }
        ],
        questionResults: [
          {
            questionId: 5546,
            playersCorrect: [
              "Hayden"
            ],
            averageAnswerTime: 45,
            percentCorrect: 54
          }
        ]
    });

    expect(resStartSession.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  });

  test('Successful player results retrieval - single player session', () => {
    const resultsResponse = requestPlayerResults(playerId);
    expect(resultsResponse.statusCode).toBe(httpStatus.SUCCESSFUL_REQUEST);
    expect(resultsResponse.body).toMatchObject({
      usersRankedByScore: [{ playerName: "abcde123", score: 5 }],
      questionResults: [
        {
          questionId,
          playersCorrect: ["abcde123"],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100
        }
      ]
    });
  });

  test('Successful player results retrieval - multiple players with varied scores', () => {
    const player2 = requestjoinPlayer(sessionId, 'player2');
    const player2Id = (player2.body as player).playerId;
    const resultsResponse = requestPlayerResults(playerId);

    expect(resultsResponse.statusCode).toBe(httpStatus.SUCCESSFUL_REQUEST);
    expect(resultsResponse.body.usersRankedByScore).toEqual([
      { playerName: 'abcde123', score: expect.any(Number) },
      { playerName: 'player2', score: expect.any(Number) }
    ]);
  });

  test('Error when player ID does not exist', () => {
    const invalidPlayerId = 9999; // Assuming this ID doesn't exist
    const resultsResponse = requestPlayerResults(invalidPlayerId);

    expect(resultsResponse.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(resultsResponse.body).toMatchObject({ error: "Player ID does not exist" });
  });

  test('Error when session state is not FINAL_RESULTS', () => {
    const resultsResponse = requestPlayerResults(playerId);

    expect(resultsResponse.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(resultsResponse.body).toMatchObject({ error: "Session is not in FINAL_RESULTS state" });
  });

  test('Error for non-participating player ID', () => {
    const otherPlayer = requestjoinPlayer(sessionId, 'otherPlayer');
    const otherPlayerId = (otherPlayer.body as player).playerId;

    const invalidPlayerId = otherPlayerId + 1; // Assuming this ID is invalid for the session
    const resultsResponse = requestPlayerResults(invalidPlayerId);

    expect(resultsResponse.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(resultsResponse.body).toMatchObject({ error: "Player did not participate in the session" });
  });

  test('Handle session with no questions', () => {
    const emptyQuiz = requestAdminQuizCreate(usertoken, 'Empty Quiz', 'No questions');
    const emptyQuizId = (emptyQuiz.body as quizCreateResponse).quizId;
    const emptySession = requestAdminStartQuizSession(emptyQuizId, usertoken, 1);
    const emptySessionId = (emptySession.body as quizStartSessionResponse).sessionId;

    const playerInEmptySession = requestjoinPlayer(emptySessionId, 'playerInEmpty');
    const playerInEmptySessionId = (playerInEmptySession.body as player).playerId;

    const resultsResponse = requestPlayerResults(playerInEmptySessionId);
    expect(resultsResponse.statusCode).toBe(httpStatus.SUCCESSFUL_REQUEST);
    expect(resultsResponse.body.questionResults).toEqual([]);
  });

  test('Handle session with no players', () => {
    const emptyResultsResponse = requestPlayerResults(playerId);
    expect(emptyResultsResponse.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(emptyResultsResponse.body).toMatchObject({ error: "No players in session" });
  });


});
