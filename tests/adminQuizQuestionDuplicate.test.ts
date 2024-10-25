import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { requestAdminAuthRegister, requestAdminQuizCreate, requestAdminQuizQuestionDuplicate, requestAdminQuizQuestionCreate, requestAdminQuizInfo } from '../src/helperfunctiontests';
import { quizCreateResponse, quizQuestionCreateResponse, quizDuplicateResponse, tokenReturn } from '../src/interface';
import { httpStatus } from './adminAuthRegister.test';

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
    const user1 = requestAdminAuthRegister('ericMa@unsw.edu.au', 'EricMa1234', 'Eric', 'Ma');
    user1token = (user1.body as tokenReturn).token;
    // create a quiz
    const quiz1 = requestAdminQuizCreate(user1token, 'quiz1', 'quiz1');
    quiz1Id = (quiz1.body as quizCreateResponse).quizId;
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
    const question = requestAdminQuizQuestionCreate(quiz1Id, questionBody.token, questionBody.questionBody);
    question1Id = (question.body as quizQuestionCreateResponse).questionId;
  });

  test('invalid token', () => {
    const res = requestAdminQuizQuestionDuplicate(quiz1Id, question1Id, JSON.stringify('abcd'));
    expect(res.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('empty token', () => {
    const res = requestAdminQuizQuestionDuplicate(quiz1Id, question1Id, JSON.stringify(''));
    expect(res.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('user is not an owner of this quiz', () => {
    // register user2
    const user2 = requestAdminAuthRegister('EricMa@unsw.edu.au', 'ericma1234', 'Eric', 'Ma');
    const user2token = (user2.body as tokenReturn).token;

    const res = requestAdminQuizQuestionDuplicate(quiz1Id, question1Id, user2token);
    expect(res.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('quiz doesnt exists', () => {
    const res = requestAdminQuizQuestionDuplicate(quiz1Id + 1, question1Id, user1token);
    expect(res.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  test('question id doesnt refer to a valid question within the quiz', () => {
    // create quiz 2
    const quiz2 = requestAdminQuizCreate(user1token, 'quiz2', 'this is quiz2');
    const quiz2Id = (quiz2.body as quizCreateResponse).quizId;
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
    const question2 = requestAdminQuizQuestionCreate(quiz2Id, questionBody.token, questionBody.questionBody);
    const question2Id = (question2.body as quizQuestionCreateResponse).questionId;
    // duplicate
    const res = requestAdminQuizQuestionDuplicate(quiz1Id, question2Id, user1token);
    expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
  });

  describe('successfully duplicate a question', () => {
    test('success when only one question is in question list', () => {
      // duplicate
      const res = requestAdminQuizQuestionDuplicate(quiz1Id, question1Id, user1token);
      expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(res.body).toStrictEqual(
        { duplicatedquestionId: expect.any(Number) }
      );
      const question2Id = (res.body as quizDuplicateResponse).duplicatedquestionId;

      // list the info in the quiz, should be two exactly same question in the list
      const quizInfoRes = requestAdminQuizInfo(quiz1Id, user1token);
      expect(quizInfoRes.body).toStrictEqual({
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
      const question2 = requestAdminQuizQuestionCreate(quiz1Id, user1token, questionBody.questionBody);
      const question2Id = (question2.body as quizQuestionCreateResponse).questionId;
      // duplicate question1
      const res = requestAdminQuizQuestionDuplicate(quiz1Id, question1Id, user1token);
      const duplicateId = (res.body as quizDuplicateResponse).duplicatedquestionId;

      expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      expect(res.body).toStrictEqual(
        { duplicatedquestionId: expect.any(Number) }
      );

      // list the info in the quiz, should be 3 questions in the list
      const quizInfoRes = requestAdminQuizInfo(quiz1Id, user1token);
      expect(quizInfoRes.body).toStrictEqual({
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
