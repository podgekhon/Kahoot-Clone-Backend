import {
	requestAdminAuthRegister,
	requestAdminQuizCreate,
	requestAdminQuizQuestionCreateV2,
	requestAdminStartQuizSession,
	requestClear,
	requestjoinPlayer,
	httpStatus,
	requestPlayerMessage
} from '../src/requestHelperFunctions';

import {
	tokenReturn,
	quizCreateResponse,
	quizStartSessionResponse,
	playerId
} from '../src/interface';

beforeEach(() => {
	requestClear();
});

describe('tests for player message send', () => {
	let token: string;
	let quizId: number;
	let quizSessionId: number;
	let playerId: number;
	beforeEach(() => {
    const user = requestAdminAuthRegister('test@gmail.com', 'validPassword5', 'Guanlin', 'Kong');
    token = (user.body as tokenReturn).token;

		const quiz = requestAdminQuizCreate(token, 'validQuizName', 'validQuizDescription');
    quizId = (quiz.body as quizCreateResponse).quizId;

    const questionBody = {
      question: 'What is the capital of Australia?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    requestAdminQuizQuestionCreateV2(quizId, token, questionBody);

    const session = requestAdminStartQuizSession(quizId, token, 1);
    quizSessionId = (session.body as quizStartSessionResponse).sessionId;

		const player = requestjoinPlayer(quizSessionId, 'Xiaoyuan ma');
		playerId = (player.body as playerId).playerId;

	})
	test('player ID does not exists', () => {
		const res = requestPlayerMessage(-1, 'no player ID');
		expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
		expect(res.body).toStrictEqual({ error: expect.any(String) });
	});
	
	describe('invalid message body', () => {
		test('message too short', () => {
			const res = requestPlayerMessage(playerId, '');
			expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
			expect(res.body).toStrictEqual({ error: expect.any(String) });
		});

		test('message too long', () => {
			const res = requestPlayerMessage(
				playerId,
				'asdfasdfjklasfdjklsafjkdlsa;jfdklsagdjksaljgkldsajkfl' +
				'fdsafjieowajgnklewjakljelfwjaiofejiwogjeiowjaoijfioejwao'
			);
			expect(res.statusCode).toStrictEqual(httpStatus.BAD_REQUEST);
			expect(res.body).toStrictEqual({ error: expect.any(String) });
		});
	});

	test('successfully send the message', () => {
		const res = requestPlayerMessage(playerId, 'hello guys');
		// correct return type
		expect(res.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
		expect(res.body).toStrictEqual({});

		/*
		 commented out bcz functions are not implemented
		// get the message list
		const msgList = requestPlayerMessageList();
		expect(msgList.statusCode).toStrictEqual(httpStatus.SUCCESSFUL_REQUEST);
		expect(msgList.body).toStrictEqual({
			messages: [
				{
					messageBody: 'hello guys',
					playerId: playerId,
					playerName: 'Xiaoyuan Ma,
					timeSent: expect.any(Number)
				}
			]
		})
		*/
	})

});


