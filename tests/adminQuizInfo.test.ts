import { 
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminQuizQuestionCreate,
  requestAdminQuizUpdateThumbnail,
  requestAdminQuizInfoV2,
  requestClear,
  httpStatus
} from '../src/requestHelperFunctions';

import { 
  quizInfo,
  tokenReturn,
  quizCreateResponse,
  quizQuestionCreateResponse
} from '../src/interface';

beforeEach(() => {
  requestClear();
});

describe('HTTP tests for getting quiz info', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
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

    const resCreateQuestion1 = requestAdminQuizQuestionCreate(
      quiz.quizId, 
      question1.token, 
      question1.questionBody
    );
    expect(resCreateQuestion1.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    const createdQuestion1 = resCreateQuestion1.body as quizQuestionCreateResponse;

    const resCreateQuestion2 = requestAdminQuizQuestionCreate(
      quiz.quizId,
      question2.token,
      question2.questionBody
    );
    
    expect(resCreateQuestion2.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    const createdQuestion2 = resCreateQuestion2.body as quizQuestionCreateResponse;

    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, user.token);
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
    const quizInfo = resQuizInfo.body as quizInfo;

    expect(quizInfo).toMatchObject({
      quizId: quiz.quizId,
      name: 'validQuizName',
      description: 'validQuizDescription',
      numQuestions: 2,
      questions: expect.any(Array),
      timeLimit: expect.any(Number),
    });

    // Verify that the questions exist in the `questions` array, 
    // without assuming order
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
    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, '');
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
    expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when token is invalid', () => {
    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, 'invalidToken');
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

    // User2 tries to access the quiz of original user
    const resQuizInfo = requestAdminQuizInfo(quiz.quizId, user2.token)
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
  });

  test('returns error when quiz does not exist', () => {
    const invalidQuizId = quiz.quizId + 1;
    const resQuizInfo = requestAdminQuizInfo(invalidQuizId, user.token);
    expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
    expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
  });

  describe('tests for adminQuizInfoV2 route', () => {
    test('successfully fetches quiz thumbnail URL using requestAdminQuizInfoV2', () => {
      const newThumbnailUrl = 'http://example.com/image.jpg';
      const resUpdateThumbnail = requestAdminQuizUpdateThumbnail(
        quiz.quizId,
        user.token,
        newThumbnailUrl
      );
      expect(resUpdateThumbnail.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
  
      const resQuizInfo = requestAdminQuizInfoV2(quiz.quizId, user.token);
      expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
      const quizInfo = resQuizInfo.body as quizInfo;
      expect(quizInfo.thumbnailUrl).toStrictEqual(newThumbnailUrl);
    });

    test('returns error for invalid token', () => {
      const resQuizInfo = requestAdminQuizInfoV2(quiz.quizId, 'invalidToken');
      expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.UNAUTHORIZED);
      expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
    });

    test('returns error for non existent quiz', () => {
      const invalidQuizId = quiz.quizId + 1;
      const resQuizInfo = requestAdminQuizInfoV2(invalidQuizId, user.token);
      expect(resQuizInfo.statusCode).toStrictEqual(httpStatus.FORBIDDEN);
      expect(resQuizInfo.body).toStrictEqual({ error: expect.any(String) });
    });
  });
});
