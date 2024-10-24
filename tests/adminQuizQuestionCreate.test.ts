import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

import { question } from '../src/interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('HTTP tests for quiz question create', () => {
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

  test('successfully creates a quiz question', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toHaveProperty('questionId');
    const createdQuestionId = bodyObj.questionId;

    // Get quizInfo to verify that the question was added
    const resQuizInfo = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}`,
        {
          qs: {
            token: user.token,
          },
          timeout: 100,
        }
    );

    expect(resQuizInfo.statusCode).toStrictEqual(200);
    const quizInfo = JSON.parse(resQuizInfo.body as string);

    // Verify the quiz contains the newly added question
    expect(quizInfo).toHaveProperty('questions');
    const addedQuestion = quizInfo.questions.find(
      (q: question) => q.questionId === createdQuestionId
    );

    // Check that the question matches the one created
    expect(addedQuestion).toMatchObject({
      questionId: createdQuestionId,
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      points: 5,
      answerOptions: expect.arrayContaining([
        expect.objectContaining({
          answer: 'Prince Charles',
          correct: true,
        }),
        expect.objectContaining({
          answer: 'Prince William',
          correct: false,
        }),
      ]),
    });
  });

  test('returns error when question length is invalid', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        // Invalid question string since it is less that 5 characters or more
        // than 50 characters in length
        question: 'Who?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when points are out of range', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        // Invalid points since points are less than 1 or greater than 10
        points: 20,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when there are duplicate answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            // Duplicate answer
            answer: 'Prince Charles',
            correct: false,
          },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
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

    const questionBody = {
      token: user2.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Prince William',
            correct: false,
          },
        ],
      },
    };

    // User2 tries to access quiz created by original user
    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question has more than 6 answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Sydney', correct: false },
          { answer: 'Melbourne', correct: false },
          { answer: 'Canberra', correct: true },
          { answer: 'Brisbane', correct: false },
          { answer: 'Perth', correct: false },
          { answer: 'Adelaide', correct: false },
          // Extra answer
          { answer: 'Hobart', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question has fewer than 2 answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          // Only one answer, hence invalid
          { answer: 'Canberra', correct: true },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question timeLimit is not a positive number', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        // Invalid time limit since it is negative
        timeLimit: -1,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when total question timeLimits in quiz exceed 3 minutes', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        // 225 seconds exceeds 3 minutes (180s)
        timeLimit: 225,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when answer length is shorter than 1 or longer than 30 characters', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          // Answer legnth is too short
          { answer: '', correct: true },
          { answer: 'Canberra', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when there are no correct answers', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          // None of the answers are true
          { answer: 'Sydney', correct: false },
          { answer: 'Melbourne', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is empty or invalid', () => {
    const questionBody = {
      // Empty token, hence invalid
      token: '',
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;

    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resCreateQuestion = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resCreateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});
