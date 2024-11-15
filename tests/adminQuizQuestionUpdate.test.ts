import {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizCreateV2,
  requestAdminQuizInfo,
  requestAdminQuizInfoV2,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizQuestionUpdate,
  requestAdminQuizQuestionUpdateV2,
  requestClear,
} from '../src/requestHelperFunctions';

import {
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse,
  question,
  quizInfo,
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
      requestQuizQuestionUpdate: requestAdminQuizQuestionUpdate,
    },
    {
      version: 'v2',
      requestQuizCreate: requestAdminQuizCreateV2,
      requestQuizInfo: requestAdminQuizInfoV2,
      requestQuizQuestionCreate: requestAdminQuizQuestionCreateV2,
      requestQuizQuestionUpdate: requestAdminQuizQuestionUpdateV2,
    },
  ];

  testCases.forEach(
    ({
      version,
      requestQuizCreate,
      requestQuizInfo,
      requestQuizQuestionCreate,
      requestQuizQuestionUpdate
    }) => {
      describe(`Tests for ${version}`, () => {
        let user: { token: string };
        let quiz: { quizId: number };
        let questionId: number;

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

          // Create a question to update
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
          const questionResponse = resCreateQuestion.body as quizQuestionCreateResponse;
          questionId = questionResponse.questionId;
        });

        test('successfully updates a quiz question', () => {
          const updatedQuestion1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            updatedQuestion1.token,
            updatedQuestion1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({});

          // Retrieve the updated quiz info to verify the question update
          const resQuizInfo = requestQuizInfo(quiz.quizId, user.token);
          expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
          const quizInfo = resQuizInfo.body as quizInfo;

          // Verify the quiz contains the updated question
          expect(quizInfo).toHaveProperty('questions');
          const updatedQuestion = quizInfo.questions.find(
            (q: question) => q.questionId === questionId
          );

          // Check that the updated question matches the new values
          expect(updatedQuestion).toMatchObject({
            questionId: questionId,
            question: 'Who is the current Monarch of the UK?',
            timeLimit: 5,
            points: 6,
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
            // Verify that thumbnailUrl exists and is the same if v2
            ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
          });
        });

        test('returns error when question length is invalid', () => {
          const invalidQuestion = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            invalidQuestion.token,
            invalidQuestion.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when points are out of range', () => {
          const invalidPoints = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            invalidPoints.token,
            invalidPoints.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when there are duplicate answers', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
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
              points: 3,
              answerOptions: [
                { answer: 'Prince Charles', correct: true },
                { answer: 'Prince William', correct: false },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          // User2 tries to update the question from the quiz created by original user
          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
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
                // Extra answer since max is 6
                { answer: 'Hobart', correct: false },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when question has fewer than 2 answers', () => {
          const question1 = {
            token: user.token,
            questionBody: {
              question: 'What is the capital of Australia?',
              timeLimit: 4,
              points: 5,
              answerOptions: [
                // Invalid since only one answer
                { answer: 'Canberra', correct: true },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error when question timeLimit is not a positive number', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
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

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error - answer length is < 1 or > 30 characters', () => {
          const question1 = {
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
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
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

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
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

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
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

          const resUpdateQuestion = requestQuizQuestionUpdate(
            invalidQuizId,
            questionId,
            question1.token,
            question1.questionBody
          );

          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });

        test('returns error - questionId does not refer to valid question within quiz', () => {
          const invalidQuestionId = questionId + 1;

          const question1 = {
            token: user.token,
            questionBody: {
              question: 'What is the capital of Australia?',
              timeLimit: 30,
              points: 5,
              answerOptions: [
                { answer: 'Canberra', correct: true },
                { answer: 'Sydney', correct: false },
              ],
              ...(version === 'v2' && { thumbnailUrl: 'http://example.com/image1.jpg' }),
            },
          };

          const resUpdateQuestion = requestQuizQuestionUpdate(
            quiz.quizId,
            invalidQuestionId,
            question1.token,
            question1.questionBody
          );
          expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
          expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
        });
      });
    });
});

describe('HTTP tests ONLY for v2 updating quiz question with thumbnail', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let questionId: number;

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

    // Create a question to update using the v2 route
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
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      },
    };

    const resCreateQuestion = requestAdminQuizQuestionCreateV2(
      quiz.quizId,
      question1.token,
      question1.questionBody
    );
    const questionResponse = resCreateQuestion.body as quizQuestionCreateResponse;
    questionId = questionResponse.questionId;
  });

  test('returns error when thumbnailUrl is invalid', () => {
    const updatedQuestion = {
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
        // Invalid URL since it does not start with http
        thumbnailUrl: 'invalid-url',
      },
    };

    const resUpdateQuestion = requestAdminQuizQuestionUpdateV2(
      quiz.quizId,
      questionId,
      updatedQuestion.token,
      updatedQuestion.questionBody
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when thumbnailUrl is empty', () => {
    const updatedQuestion = {
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
        // Empty thumbnail URL is invalid
        thumbnailUrl: '',
      },
    };

    const resUpdateQuestion = requestAdminQuizQuestionUpdateV2(
      quiz.quizId,
      questionId,
      updatedQuestion.token,
      updatedQuestion.questionBody
    );

    expect(resUpdateQuestion.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
    expect(resUpdateQuestion.body).toStrictEqual({ error: expect.any(String) });
  });
});
