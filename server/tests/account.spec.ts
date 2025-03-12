import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app'; // Ensure your app export is set correctly
import { Account } from '../types';
import * as util from '../models/application';
import AccountModel from '../models/accounts';

const mockAccount: Account = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'securepassword123',
  questions: [],
  answers: [],
  threads: [],
  createdAt: new Date(),
};

const simplifyAccount = (account: Account) => ({
  ...account,
  _id: account._id?.toString(), // Convert ObjectId to string
  createdAt: account.createdAt.toISOString(), // Format Date to ISO string
});

jest.mock('../models/accounts');
jest.mock('../models/application');

describe('AccountController Tests', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /addAccount', () => {
    it('should add a new account', async () => {
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(null); // No existing email
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(null); // No existing username
      jest.spyOn(util, 'saveAccount').mockResolvedValueOnce(mockAccount);

      const response = await supertest(app).post('/account/addAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'securepassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyAccount(mockAccount));
    });

    it('should return 400 if email already exists', async () => {
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(mockAccount);

      const response = await supertest(app).post('/account/addAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'securepassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already in use');
    });

    it('should return 400 if username already exists', async () => {
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(null); // No existing email
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(mockAccount); // Existing username

      const response = await supertest(app).post('/account/addAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'securepassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username already in use');
    });

    it('should return 500 on server error', async () => {
      jest.spyOn(AccountModel, 'findOne').mockRejectedValueOnce(new Error('Database Error'));

      const response = await supertest(app).post('/account/addAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'securepassword123',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when adding account');
    });

    // New Test: Invalid Request Body
    it('should return 400 if the request body is invalid', async () => {
      const response = await supertest(app).post('/account/addAccount').send({
        username: '', // Invalid body: missing fields or empty values
        email: '',
        password: '',
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Add account request body is invalid');
    });

    // New Test: Error in saveAccount
    it('should throw an error if saveAccount returns an error', async () => {
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(null); // No existing email
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(null); // No existing username
      jest.spyOn(util, 'saveAccount').mockResolvedValueOnce({ error: 'Failed to save account' });

      const response = await supertest(app).post('/account/addAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'securepassword123',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when adding account: Failed to save account');
    });
  });

  describe('POST /findOrCreateAccount', () => {
    it('should find an existing account', async () => {
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(mockAccount);

      const response = await supertest(app).post('/account/findOrCreateAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyAccount(mockAccount));
    });

    it('should create a new account if not found', async () => {
      jest.spyOn(AccountModel, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(util, 'saveAccount').mockResolvedValueOnce(mockAccount);

      const response = await supertest(app).post('/account/findOrCreateAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyAccount(mockAccount));
    });

    it('should return 500 if an error occurs', async () => {
      jest.spyOn(AccountModel, 'findOne').mockRejectedValueOnce(new Error('Database Error'));

      const response = await supertest(app).post('/account/findOrCreateAccount').send({
        username: 'testuser',
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error in findOrCreateAccount');
    });
  });
});
