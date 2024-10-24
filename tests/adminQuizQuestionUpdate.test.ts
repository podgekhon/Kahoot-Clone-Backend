import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('HTTP tests for quiz question update', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let questionId: number;

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

    // Create a question to update
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
    const questionResponse = JSON.parse(resCreateQuestion.body as string);
    questionId = questionResponse.questionId;
  });

  test('successfully updates a quiz question', () => {
    const updatedQuestionBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the current Monarch of the UK?',
        timeLimit: 5,
        points: 6,
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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: updatedQuestionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(200);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({});
  });

  test('returns error when question length is invalid', () => {
    const invalidQuestionBody = {
      token: user.token,
      questionBody: {
        // Invalid since question string is is less than 5 characters in length
        // or greater than 50 characters in length
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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: invalidQuestionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when points are out of range', () => {
    const invalidPointsBody = {
      token: user.token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        // Invalid since points awarded for the question are less than 1 or
        // greater than 10
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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: invalidPointsBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          { answer: 'Prince Charles', correct: true },
          // Duplicate answer
          { answer: 'Prince Charles', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
        points: 3,
        answerOptions: [
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince William', correct: false },
        ],
      },
    };

    // User2 tries to update the question from the quiz created by original user
    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          // Extra answer since max is 6
          { answer: 'Hobart', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          // Invalid since only one answer
          { answer: 'Canberra', correct: true },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when question timeLimit is not a positive number', () => {
    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        // Invalid timeLimit since it is negative
        timeLimit: -1,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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
          // Answer length is too short
          { answer: '', correct: true },
          { answer: 'Canberra', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(401);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = 'invalid-quiz-id';

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

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${invalidQuizId}/question/${questionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(403);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when Question ID does not refer to a valid question within this quiz', () => {
    const invalidQuestionId = 'invalid-question-id';

    const questionBody = {
      token: user.token,
      questionBody: {
        question: 'What is the capital of Australia?',
        timeLimit: 30,
        points: 5,
        answerOptions: [
          { answer: 'Canberra', correct: true },
          { answer: 'Sydney', correct: false },
        ],
      },
    };

    const resUpdateQuestion = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quiz.quizId}/question/${invalidQuestionId}`,
        {
          json: questionBody,
          timeout: 100,
        }
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(400);
    const bodyObj = JSON.parse(resUpdateQuestion.body as string);
    expect(bodyObj).toStrictEqual({ error: expect.any(String) });
  });
});
