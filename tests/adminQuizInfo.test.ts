import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizCreateV2,
  requestAdminQuizInfo,
  requestAdminQuizInfoV2,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionCreateV2,
  requestClear,
  httpStatus
} from '../src/requestHelperFunctions';

import {
  quizInfo,
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse
} from '../src/interface';

describe('HTTP tests for getting quiz info (both v1 and v2 routes)', () => {
  const testCases = [
    {
      version: 'v1',
      requestQuizCreate: requestAdminQuizCreate,
      requestQuizInfo: requestAdminQuizInfo,
      requestQuizQuestionCreate: requestAdminQuizQuestionCreate,
    },
    {
      version: 'v2',
      requestQuizCreate: requestAdminQuizCreateV2,
      requestQuizInfo: requestAdminQuizInfoV2,
      requestQuizQuestionCreate: requestAdminQuizQuestionCreateV2,
    },
  ];

  testCases.forEach(
    ({ 
      version, 
      requestQuizCreate, 
      requestQuizInfo, 
      requestQuizQuestionCreate 
    }) => {
    describe(`Tests for ${version}`, () => {
      let user: { token: string };
      let quiz: { quizId: number };

      beforeEach(() => {
        requestClear();
        const resRegister = requestAdminAuthRegister(
          'test@gmail.com',
          'validPassword5',
          'Patrick',
          'Chen'
        );
        user = resRegister.body as tokenReturn;

        const resCreateQuiz = requestQuizCreate(
          user.token,
          'validQuizName',
          'validQuizDescription'
        );
        quiz = resCreateQuiz.body as quizCreateResponse;
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
            ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
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
            ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image2.jpg' }),
          },
        };

        const resCreateQuestion1 = requestQuizQuestionCreate(
          quiz.quizId,
          question1.token,
          question1.questionBody
        );
        expect(resCreateQuestion1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        const createdQuestion1 = resCreateQuestion1.body as quizQuestionCreateResponse;

        const resCreateQuestion2 = requestQuizQuestionCreate(
          quiz.quizId,
          question2.token,
          question2.questionBody
        );
        expect(resCreateQuestion2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        const createdQuestion2 = resCreateQuestion2.body as quizQuestionCreateResponse;

        const resQuizInfo = requestQuizInfo(quiz.quizId, user.token);
        expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
        const quizInfoData = resQuizInfo.body as quizInfo;

        expect(quizInfoData).toMatchObject({
          quizId: quiz.quizId,
          name: 'validQuizName',
          description: 'validQuizDescription',
          numQuestions: 2,
          questions: expect.any(Array),
          timeLimit: expect.any(Number),
        });

        // Verify that the questions exist in the questions array without assuming order
        const questionIds = quizInfoData.questions.map(q => q.questionId);
        expect(questionIds).toEqual(expect.arrayContaining([createdQuestion1.questionId, createdQuestion2.questionId]));

        // Check details for each question by finding them in the questions array
        const fetchedQuestion1 = quizInfoData.questions.find(
          q => q.questionId === createdQuestion1.questionId
        );
        const fetchedQuestion2 = quizInfoData.questions.find(
          q => q.questionId === createdQuestion2.questionId
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
          ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
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
          ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image2.jpg' }),
        });
      });

      test('returns error when token is empty', () => {
        const resQuizInfo = requestQuizInfo(quiz.quizId, '');
        expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
        expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
      });

      test('returns error when token is invalid', () => {
        const resQuizInfo = requestQuizInfo(quiz.quizId, 'invalidToken');
        expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
        expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
      });

      test('returns error when user is not the quiz owner', () => {
        const resRegisterUser2 = requestAdminAuthRegister(
          'user2@gmail.com',
          'validPassword2',
          'User',
          'Two'
        );
        const user2 = resRegisterUser2.body as tokenReturn;

        const resQuizInfo = requestQuizInfo(quiz.quizId, user2.token);
        expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
        expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
      });

      test('returns error when quiz does not exist', () => {
        const invalidQuizId = quiz.quizId + 1;
        const resQuizInfo = requestQuizInfo(invalidQuizId, user.token);
        expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
        expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
      });
    });
  });
});
