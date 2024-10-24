import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { quizQuestionCreateResponse } from '../src/interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('HTTP tests for getting quiz info', () => {
  let user: { token: string };
  let quiz: { quizId: number };

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
  });

  test('successfully fetches quiz info with created questions', () => {
    // Create two questions to add to the quiz
    const question1 = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 10,
        points: 5,
        answerOptions: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false },
        ],
      },
    };

    const question2 = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 5,
        points: 3,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion1 = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        { json: question1, timeout: 100 }
    );
    expect(resCreateQuestion1.statusCode).toStrictEqual(200);
    const createdQuestion1 = JSON.parse(resCreateQuestion1.body as string);

    const resCreateQuestion2 = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        { json: question2, timeout: 100 }
    );
    expect(resCreateQuestion2.statusCode).toStrictEqual(200);
    const createdQuestion2 = JSON.parse(resCreateQuestion2.body as string);

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

    expect(quizInfo).toMatchObject({
      quizId: quiz.quizId,
      name: 'validQuizName',
      description: 'validQuizDescription',
      numQuestions: 2,
      questions: expect.any(Array),
      timeLimit: expect.any(Number),
    });

    // Verify that the questions exist in the `questions` array, without assuming order
    const questionIds = quizInfo.questions.map(
      (q: quizQuestionCreateResponse) => q.questionId
    );

    expect(questionIds).toEqual(
      expect.arrayContaining([createdQuestion1.questionId, createdQuestion2.questionId])
    );

    // Check details for each question by finding them in the questions array
    const fetchedQuestion1 = quizInfo.questions.find(
      (q: quizQuestionCreateResponse) => q.questionId === createdQuestion1.questionId
    );

    const fetchedQuestion2 = quizInfo.questions.find(
      (q: quizQuestionCreateResponse) => q.questionId === createdQuestion2.questionId
    );

    expect(fetchedQuestion1).toMatchObject({
      questionId: createdQuestion1.questionId,
      question: 'Who is the Monarch of England?',
      timeLimit: 10,
      points: 5,
      answerOptions: expect.arrayContaining([
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String),
          correct: true,
        }),
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Prince William',
          colour: expect.any(String),
          correct: false,
        }),
      ]),
    });

    expect(fetchedQuestion2).toMatchObject({
      questionId: createdQuestion2.questionId,
      question: 'What is the capital of Australia?',
      timeLimit: 5,
      points: 3,
      answerOptions: expect.arrayContaining([
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Canberra',
          colour: expect.any(String),
          correct: true,
        }),
        expect.objectContaining({
          answerId: expect.any(Number),
          answer: 'Sydney',
          colour: expect.any(String),
          correct: false,
        }),
      ]),
    });
  });

  test('returns error when token is empty', () => {
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: {
            token: '',
          },
          timeout: 100,
        }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: {
            token: 'invalidToken',
          },
          timeout: 100,
        }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when user is not the quiz owner', () => {
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

    // User2 tries to access the quiz of original user
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: {
            token: user2.token,
          },
          timeout: 100,
        }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;

    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${invalidQuizId}`,
        {
          qs: {
            token: user.token,
          },
          timeout: 100,
        }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resQuizInfo.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});
