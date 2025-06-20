// test/app.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const { expect } = require('chai');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../model/User'); // Adjust the path as necessary
const app = require('../app');

let mongoServer;

describe('User API (MongoDB)', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /hello', () => {
    it('should return hello message', async () => {
      const res = await request(app).get('/hello');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Hello, world!');
    });
  });
  describe('GET /bye', () => {
    it('should return bye message', async () => {
      const res = await request(app).get('/bye');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Hello, world!');
    });
  });

  describe('POST /users', () => {
    it('should create a user with name and email', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' });

      expect(res.status).to.equal(201);
      expect(res.body).to.include({ name: 'Alice', email: 'alice@example.com' });
      expect(res.body).to.have.property('_id');
    });

    it('should return 400 if name or email is missing', async () => {
      const res = await request(app).post('/users').send({ name: 'Bob' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should return 409 if email already exists', async () => {
      await request(app).post('/users').send({ name: 'Alice', email: 'alice@example.com' });

      const res = await request(app)
        .post('/users')
        .send({ name: 'Alice2', email: 'alice@example.com' });

      expect(res.status).to.equal(409);
      expect(res.body).to.have.property('error', 'Email already exists.');
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      await User.create({ name: 'Alice', email: 'alice@example.com' });
      await User.create({ name: 'Bob', email: 'bob@example.com' });

      const res = await request(app).get('/users');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
    });
  });
});
