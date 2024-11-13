import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminStartQuizSession,
  httpStatus,
  requestAdminQuizSessionUpdate,
  requestadminQuizSessionState,
  requestClear,
  requestAdminGetFinalResults,
  requestPlayerAnswerQuestion,
  requestAdminQuizInfo,
  requestjoinPlayer
} from '../src/requestHelperFunctions';
import {
  userAuthRegister,
  tokenReturn,
  quizCreate,
  quizCreateResponse,
  startSession,
  quizStartSessionResponse,
  GetFinalResults,
  playerJoinRes,
  player,
  quizInfo
} from '../src/interface';
import { adminAction } from '../src/quiz';
import sleepSync from 'slync';

describe('Test for adminGetFinalResults', () => {
  let user1Response: userAuthRegister;
  let user2Response: userAuthRegister;
  let user1Token: string;
  let user2Token: string;
  let player2Name: string;
  let player3Name: string;
  let player2Id: number;
  let player3Id: number;
  let player2JoinRes: playerJoinRes;
  let player3JoinRes: playerJoinRes;
  let quizCreateResponse: quizCreate;
  let quizId: number;
  let startSessionResponse: startSession;
  let sessionId: number;
  let adminGetFinalResults: GetFinalResults;

  beforeEach(() => {
    requestClear();
    user1Response = requestAdminAuthRegister(
      'user1@gmail.com',
      'validPassword1',
      'User',
      'One'
    );

    user1Token = (user1Response.body as tokenReturn).token;

    user2Response = requestAdminAuthRegister(
      'user2@gmail.com',
      'validPassword2',
      'User',
      'Two'
    );

    user2Token = (user2Response.body as tokenReturn).token;

    requestAdminAuthRegister(
      'user3@gmail.com',
      'validPassword3',
      'User',
      'Three'
    );
    user2Token = (user2Response.body as tokenReturn).token;

    quizCreateResponse = requestAdminQuizCreate(
      user1Token,
      'validQuizName',
      'validQuizDescription'
    );
    quizId = (quizCreateResponse.body as quizCreateResponse).quizId;

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

    requestAdminQuizQuestionCreateV2(
      quizId,
      user1Token,
      questionBody
    );

    startSessionResponse = requestAdminStartQuizSession(
      quizId,
      user1Token,
      1
    );

    sessionId = (
      startSessionResponse.body as quizStartSessionResponse
    ).sessionId;

    requestadminQuizSessionState(
      quizId,
      sessionId,
      user1Token
    );

    // players join
    player2Name = 'player2';
    player2JoinRes = requestjoinPlayer(sessionId, player2Name);
    player2Id = (player2JoinRes.body as player).playerId;

    player3Name = 'player3';
    player3JoinRes = requestjoinPlayer(sessionId, player3Name);
    player3Id = (player3JoinRes.body as player).playerId;

    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.NEXT_QUESTION);
    sleepSync(3 * 1000);

    // player answers question
    const resQuizInfo = requestAdminQuizInfo(quizId, user1Token);
    const quizInfo = resQuizInfo.body as quizInfo;
    const answerId = [quizInfo.questions[0].answerOptions[0].answerId];

    requestPlayerAnswerQuestion(answerId, player2Id, 1);

    requestPlayerAnswerQuestion(answerId, player3Id, 1);

    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.GO_TO_ANSWER);
  });

  test('User successfully gets final results', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.GO_TO_FINAL_RESULT);
    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.SUCCESSFUL_REQUEST
    );
    expect(adminGetFinalResults.body).toStrictEqual({
      usersRankedByScore: [
        {
          playerName: player2Name,
          score: expect.any(Number)
        },
        {
          playerName: player3Name,
          score: expect.any(Number)
        }
      ],
      questionResults: [
        {
          questionId: expect.any(Number),
          playersCorrect: [
            player2Name,
            player3Name
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      ]
    });
  });

  test('Return error for invalid SessionId', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.GO_TO_FINAL_RESULT);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId + 1,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.BAD_REQUEST
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for session not in FINAL_RESULTS state', () => {
    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.BAD_REQUEST
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for invalid token', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.GO_TO_FINAL_RESULT);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user1Token + 1
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.UNAUTHORIZED
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for invalid quizId', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.GO_TO_FINAL_RESULT);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId + 1,
      sessionId,
      user1Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.FORBIDDEN
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Return error for user does not own quiz', () => {
    requestAdminQuizSessionUpdate(quizId, sessionId, user1Token, adminAction.GO_TO_FINAL_RESULT);

    adminGetFinalResults = requestAdminGetFinalResults(
      quizId,
      sessionId,
      user2Token
    );

    expect(adminGetFinalResults.statusCode).toStrictEqual(
      httpStatus.FORBIDDEN
    );
    expect(adminGetFinalResults.body).toStrictEqual({ error: expect.any(String) });
  });
});
