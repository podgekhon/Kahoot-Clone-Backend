import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 100 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('test for quiz duplicate', () => {
  let user1token: string;
  let quiz1Id: number;
  let question1Id: number;
  // register a user, create a quiz, create a question
  beforeEach(() => {
    const registerResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'admin@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Admin',
        nameLast: 'User'
      },
      timeout: TIMEOUT_MS
    });
    user1token = JSON.parse(registerResponse.body.toString()).token;
    // create a quiz
    const createQuizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'quiz1',
        description: 'quiz1'
      },
      timeout: TIMEOUT_MS
    });
    quiz1Id = JSON.parse(createQuizResponse.body.toString()).quizId;

    const questionBody = {
      token: user1token,
      questionBody: {
        question: 'question1',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'answer1',
            correct: true,
          },
          {
            answer: 'answer2',
            correct: false,
          },
        ],
      },
    };
    const createQuestionRes = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`,
      {
        json: questionBody,
        timeout: TIMEOUT_MS
      }
    );
    question1Id = JSON.parse(createQuestionRes.body.toString()).questionId;
  });

  test('invalid token', () => {
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
      {
        json: {
          token: JSON.stringify('fdsafdsa')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(401);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
      {
        json: {
          token: JSON.stringify('')
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(401);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('user is not an owner of this quiz', () => {
    // register user2
    const registerResponse = request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: {
        email: 'EricMa@unsw.edu.au',
        password: 'AdminPass1234',
        nameFirst: 'Eric',
        nameLast: 'Ma'
      },
      timeout: TIMEOUT_MS
    });
    const user2token = JSON.parse(registerResponse.body.toString()).token;

    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
      {
        json: {
          token: user2token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(403);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('quiz doesnt exists', () => {
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id + 1}/question/${question1Id}/duplicate`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(403);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('question id doesnt refer to a valid question within the quiz', () => {
    // create quiz 2
    const createQuizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: user1token,
        name: 'Test Quiz',
        description: 'This is a test quiz'
      },
      timeout: TIMEOUT_MS
    });
    const quiz2Id = JSON.parse(createQuizResponse.body.toString()).quizId;
    // create question under quiz2
    const questionBody = {
      token: user1token,
      questionBody: {
        question: 'question2',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'answer1',
            correct: true,
          },
          {
            answer: 'answer2',
            correct: false,
          },
        ],
      },
    };
    const createQuestionRes = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz2Id}`,
      {
        json: questionBody,
        timeout: TIMEOUT_MS
      }
    );
    const question2Id = JSON.parse(createQuestionRes.body.toString()).questionId;
    // duplicate
    const res = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question2Id}/duplicate`,
      {
        json: {
          token: user1token
        },
        timeout: TIMEOUT_MS
      }
    );
    expect(res.statusCode).toStrictEqual(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  describe('successfully duplicate a question', () => {
    test('success when only one question is in question list', () => {
      // duplicate
      const res = request(
        'POST',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
        {
          json: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );
      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        { duplicatedquestionId: expect.any(Number) }
      );
      const question2Id = JSON.parse(res.body.toString()).duplicatedquestionId;

      // list the info in the quiz, should be two exactly same question in the list
      const quizInfoRes = request(
        'GET',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}`,
        {
          qs: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );
      const quizInfo = JSON.parse(quizInfoRes.body.toString());
      expect(quizInfo).toStrictEqual({
        quizId: quiz1Id,
        name: 'quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'quiz1',
        numQuestions: 2,
        questions: [
          {
            questionId: question1Id,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: question2Id,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: expect.any(Number)
      });
    });

    test('success when multiple question exist', () => {
      // create question 2
      const questionBody = {
        token: user1token,
        questionBody: {
          question: 'question2',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'answer1',
              correct: true,
            },
            {
              answer: 'answer2',
              correct: false,
            },
          ],
        },
      };
      const createQuestionRes = request(
        'POST',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`,
        {
          json: questionBody,
          timeout: TIMEOUT_MS
        }
      );
      const question2Id = JSON.parse(createQuestionRes.body.toString()).questionId;
      // duplicate question1
      const res = request(
        'POST',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Id}/duplicate`,
        {
          json: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );
      const duplicateId = JSON.parse(res.body.toString()).duplicatedquestionId;
      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        { duplicatedquestionId: expect.any(Number) }
      );

      // list the info in the quiz, should be 3 questions in the list
      const quizInfoRes = request(
        'GET',
        SERVER_URL + `/v1/admin/quiz/${quiz1Id}`,
        {
          qs: {
            token: user1token
          },
          timeout: TIMEOUT_MS
        }
      );

      const quizInfo = JSON.parse(quizInfoRes.body.toString());
      expect(quizInfo).toStrictEqual({
        quizId: quiz1Id,
        name: 'quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'quiz1',
        numQuestions: 3,
        questions: [
          {
            questionId: question1Id,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: duplicateId,
            question: 'question1',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: question2Id,
            question: 'question2',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'answer1',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'answer2',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: expect.any(Number)
      });
    });
  });
});
