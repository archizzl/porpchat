import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import QuestionModel from '../models/questions';
import AnswerModel from '../models/answers';
import AccountModel from '../models/accounts';

jest.mock('../models/questions');
jest.mock('../models/answers');
jest.mock('../models/accounts');

// Mock data
const MOCK_QUESTIONS = [
  { _id: '507f191e810c19729de860ea', title: 'Question 1', asked_by: 'testuser' },
  { _id: '507f191e810c19729de860eb', title: 'Question 2', asked_by: 'testuser' },
];

const MOCK_ANSWERS = [
  { _id: '507f191e810c19729de860ec', text: 'Answer 1', ansBy: 'testuser' },
  { _id: '507f191e810c19729de860ed', text: 'Answer 2', ansBy: 'testuser' },
];

const mockUser = {
  username: 'testuser',
  bio: 'This is a test bio',
};

describe('Profile Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementations
    (QuestionModel.find as jest.Mock).mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(MOCK_QUESTIONS),
    }));

    (AnswerModel.find as jest.Mock).mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(MOCK_ANSWERS),
    }));

    (AccountModel.findOne as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
    }));

    (AccountModel.findOneAndUpdate as jest.Mock).mockImplementation((query, update, options) => ({
      exec: jest.fn().mockResolvedValue({
        ...mockUser,
        bio: update.bio, // Return the updated bio
      }),
    }));
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoose.disconnect();
  });

  describe('GET /profile/getBio', () => {
    it('should return the username and bio of the user', async () => {
      const response = await supertest(app).get('/profile/getBio').query({ username: 'testuser' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(AccountModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).get('/profile/getBio');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing username in request');
    });

    it('should return 404 if the user is not found', async () => {
      (AccountModel.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null), // Return null for user not found
        }),
      }));

      const response = await supertest(app).get('/profile/getBio').query({ username: 'testuser' });

      expect(response.status).toBe(404);
      expect(response.text).toBe('User not found');
    });

    it('should return 500 if there is a server error', async () => {
      (AccountModel.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error')), // Simulate DB error
        }),
      }));

      const response = await supertest(app).get('/profile/getBio').query({ username: 'testuser' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when fetching user bio: Database error');
    });
  });

  describe('GET /profile/getQuestions', () => {
    it('should return all questions asked by the user', async () => {
      const response = await supertest(app)
        .get('/profile/getQuestions')
        .query({ username: 'testuser' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(MOCK_QUESTIONS);
      expect(QuestionModel.find).toHaveBeenCalledWith({ askedBy: 'testuser' });
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).get('/profile/getQuestions');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing username in request');
    });

    it('should return 404 if no questions are found', async () => {
      (QuestionModel.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      const response = await supertest(app)
        .get('/profile/getQuestions')
        .query({ username: 'testuser' });

      expect(response.status).toBe(404);
      expect(response.text).toBe('No questions found for this user');
    });

    it('should return 500 if there is a server error', async () => {
      (QuestionModel.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      const response = await supertest(app)
        .get('/profile/getQuestions')
        .query({ username: 'testuser' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when fetching user questions: Database error');
    });
  });

  describe('GET /profile/getAnswers', () => {
    it('should return all answers provided by the user', async () => {
      const response = await supertest(app)
        .get('/profile/getAnswers')
        .query({ username: 'testuser' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(MOCK_ANSWERS);
      expect(AnswerModel.find).toHaveBeenCalledWith({ ansBy: 'testuser' });
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).get('/profile/getAnswers');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing username in request');
    });

    it('should return 404 if no answers are found', async () => {
      (AnswerModel.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      const response = await supertest(app)
        .get('/profile/getAnswers')
        .query({ username: 'testuser' });

      expect(response.status).toBe(404);
      expect(response.text).toBe('No answers found for this user');
    });

    it('should return 500 if there is a server error', async () => {
      (AnswerModel.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      const response = await supertest(app)
        .get('/profile/getAnswers')
        .query({ username: 'testuser' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when fetching user answers: Database error');
    });
  });

  describe('PUT /profile/updateBio', () => {
    it('should update the user bio successfully', async () => {
      const updatedBio = 'Updated test bio';

      const response = await supertest(app)
        .put('/profile/updateBio')
        .send({ username: 'testuser', bio: updatedBio });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Bio updated successfully');
      expect(response.body.user.bio).toBe(updatedBio);
      expect(AccountModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        { bio: updatedBio },
        { new: true },
      );
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app)
        .put('/profile/updateBio')
        .send({ bio: 'Updated test bio' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid or missing username');
    });

    it('should return 400 if bio is missing', async () => {
      const response = await supertest(app)
        .put('/profile/updateBio')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid or missing bio');
    });

    it('should return 404 if the user does not exist', async () => {
      (AccountModel.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null), // Simulate user not found
      }));

      const response = await supertest(app)
        .put('/profile/updateBio')
        .send({ username: 'nonexistentUser', bio: 'Test bio' });

      expect(response.status).toBe(404);
      expect(response.text).toBe('User not found');
    });

    it('should return 500 if there is a server error', async () => {
      (AccountModel.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockRejectedValue(new Error('Database error')), // Simulate database error
      }));

      const response = await supertest(app)
        .put('/profile/updateBio')
        .send({ username: 'testuser', bio: 'Test bio' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Server Error');
    });
  });
});
