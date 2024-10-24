import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe.skip('HTTP tests for quiz question move', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let question1: { questionId: number };
  let question2: { questionId: number };
  let question3: { questionId: number };

  beforeEach(() => {
    const resRegister = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'test@gmail.com',
            password: 'validPassword5',
            nameFirst: 'Patrick',
            nameLast: 'Chen',
          },
          timeout: 100,
        }
    );
    user = JSON.parse(resRegister.body as string);

    const resCreateQuiz = request(
      'POST',
        `${url}:${port}/v1/admin/quiz`,
        {
          json: {
            token: user.token,
            name: 'validQuizName',
            description: 'validQuizDescription',
          },
          timeout: 100,
        }
    );
    quiz = JSON.parse(resCreateQuiz.body as string);

    // Create three questions for the quiz
    const createQuestion = (questionBody: any) => request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        { json: { token: user.token, questionBody }, timeout: 100 }
    );

    const resCreateQuestion1 = createQuestion({
      question: 'What is the capital of France?',
      timeLimit: 10,
      points: 5,
      answerOptions: [
        { answer: 'Paris', correct: true },
        { answer: 'Sydney', correct: false },
      ],
    });
    question1 = JSON.parse(resCreateQuestion1.body as string);

    const resCreateQuestion2 = createQuestion({
      question: 'What is the day today?',
      timeLimit: 10,
      points: 5,
      answerOptions: [
        { answer: 'Tuesday', correct: true },
        { answer: 'Friday', correct: false },
      ],
    });
    question2 = JSON.parse(resCreateQuestion2.body as string);

    const resCreateQuestion3 = createQuestion({
      question: 'What is the largest planet in our solar system?',
      timeLimit: 10,
      points: 5,
      answerOptions: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false },
      ],
    });
    question3 = JSON.parse(resCreateQuestion3.body as string);
  });

  test('successfully moves a quiz question and verifies its new position', () => {
    // Move the second question (question2) to position 0
    const resMoveQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question2.questionId}/move`,
        {
          json: {
            token: user.token,
            newPosition: 0,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(200);

    // Get quiz info to check if the question has been moved
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: { token: user.token },
          timeout: 100,
        }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(200);
    const quizInfo = JSON.parse(resQuizInfo.body as string);

    // Check if the first question in the array is now question2
    expect(quizInfo.questions[0].questionId).toStrictEqual(question2.questionId);
    expect(quizInfo.questions[1].questionId).toStrictEqual(question1.questionId);
    expect(quizInfo.questions[2].questionId).toStrictEqual(question3.questionId);
  });

  test('returns error when newPosition is out of bounds', () => {
    const resMoveQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
        {
          json: {
            token: user.token,
            newPosition: -1,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when questionId is invalid', () => {
    const resMoveQuestion = request(
      'PUT',
        // 99999 is an arbitrary questionId, hence invalid
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/99999/move`,
        {
          json: {
            token: user.token,
            newPosition: 1,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user is not the quiz owner', () => {
    // Register a second user
    const resRegisterUser2 = request(
      'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: 'user2@gmail.com',
            password: 'validPassword2',
            nameFirst: 'User',
            nameLast: 'Two',
          },
          timeout: 100,
        }
    );
    const user2 = JSON.parse(resRegisterUser2.body as string);

    // User 2 tries to move the question in User 1's quiz
    const resMoveQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
        {
          json: {
            token: user2.token,
            newPosition: 1,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resMoveQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
        {
          json: {
            token: 'invalidToken',
            newPosition: 1,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when newPosition is the same as current position', () => {
    const resMoveQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${question1.questionId}/move`,
        {
          json: {
            token: user.token,
            // The original position of question1 is zero
            newPosition: 0,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;

    const resMoveQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question/${question1.questionId}/move`,
        {
          json: {
            token: user.token,
            newPosition: 1,
          },
          timeout: 100,
        }
    );

    expect(resMoveQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resMoveQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});
