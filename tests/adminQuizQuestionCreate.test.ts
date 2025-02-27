import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizCreateV2,
  requestAdminQuizInfo,
  requestAdminQuizInfoV2,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionCreateV2,
  requestClear,
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse,
  quizInfo,
  question
} from '../src/interface';

import {
  httpStatus
} from '../src/requestHelperFunctions';

describe('HTTP tests for adminMoveQuizQuestion (both v1 and v2 routes)', () => {
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

        test('successfully creates a quiz question', () => {
          const question1 = {
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
              // add thumbnailUrl if v2
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          expect(resCreateQuestion.body).toHaveProperty('questionId');
          const createdQuestionId = (
            resCreateQuestion.body as quizQuestionCreateResponse
          ).questionId;

          // Get quizInfo to verify that the question was added
          const resQuizInfo = requestQuizInfo(
            quiz.quizId,
            user.token
          );
          const quizInfo = resQuizInfo.body as quizInfo;

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
            ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
          });
        });

        test('returns error when question length is invalid', () => {
          const question1 = {
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
              // add thumbnailUrl if v2
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );
          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when points are out of range', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );
          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when there are duplicate answers', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );
          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when user is not the quiz owner', () => {
          // Register a second user
          const resRegisterUser2 = requestAdminAuthRegister(
            'user2@gmail.com',
            'validPassword2',
            'User',
            'Two'
          );

          const user2 = resRegisterUser2.body as tokenReturn;

          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          // User2 tries to create question for quiz created by original user
          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when question has more than 6 answers', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );
          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when question has fewer than 2 answers', () => {
          const question1 = {
            token: user.token,
            questionBody: {
              question: 'What is the capital of Australia?',
              timeLimit: 4,
              points: 5,
              answerOptions: [
                // Only one answer, hence invalid
                { answer: 'Canberra', correct: true },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );
          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when question timeLimit is not a positive number', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when total question timeLimits in quiz exceed 3 minutes', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );
          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when answer length is < 1 or > 30 characters', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when there are no correct answers', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when token is empty or invalid', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            quiz.quizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when quiz does not exist', () => {
          const invalidQuizId = quiz.quizId + 1;

          const question1 = {
            token: user.token,
            questionBody: {
              question: 'What is the capital of Australia?',
              timeLimit: 4,
              points: 5,
              answerOptions: [
                { answer: 'Canberra', correct: true },
                { answer: 'Sydney', correct: false },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resCreateQuestion = requestQuizQuestionCreate(
            invalidQuizId,
            question1.token,
            question1.questionBody
          );

          expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });
      });
    });
});

describe('HTTP tests ONLY for quiz question create v2 route', () => {
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

    const resCreateQuiz = requestAdminQuizCreate(
      user.token,
      'validQuizName',
      'validQuizDescription'
    );
    quiz = resCreateQuiz.body as quizCreateResponse;
  });

  test('v2 - error when question thumbnailUrl is empty', () => {
    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      // Empty URL
      thumbnailUrl: '',
    };

    const resCreateQuestion = requestAdminQuizQuestionCreateV2(
      quiz.quizId,
      user.token,
      questionBody
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('v2 - error when quesiton thumbnailUrl has invalid file extension', () => {
    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      // .gif is an invalid extension
      thumbnailUrl: 'https://example.com/image.gif',
    };

    const resCreateQuestion = requestAdminQuizQuestionCreateV2(
      quiz.quizId,
      user.token,
      questionBody
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('v2 - error when thumbnailUrl does not start with http or https', () => {
    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      // Invalid URL prefix
      thumbnailUrl: 'abcd://example.com/image.jpg',
    };

    const resCreateQuestion = requestAdminQuizQuestionCreateV2(
      quiz.quizId,
      user.token,
      questionBody
    );

    expect(resCreateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resCreateQuestion.body).toStrictEqual({ error: expect.any(String) });
  });
});
