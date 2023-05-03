import request from 'supertest';
import server from '../server';
import { User } from '../models/user';
import { Product } from '../models/product';
import mongoose from 'mongoose';
const crypto = require('crypto');

const testUserEmail = 'testuser@example.com';
const testUserPassword = 'testpassword';

// Clean up test data
const cleanup = async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
};

beforeAll(async () => {
  await cleanup();
  await User.create({
    username: 'Test User',
    email: testUserEmail,
    password: testUserPassword,
    isEmailConfirmed: true,
  });
});

afterAll(async () => {
  await cleanup();
  // Close the mongoose connection to the test database
  await mongoose.connection.close();
  server.close();
});

// Helper function to log in and return the token
// const loginUserAndGetToken = async () => {
//   const res = await request(server)
//     .post('/api/user/login')
//     .send({
//       email: testUserEmail,
//       password: testUserPassword,
//     });
//   return res.body.token;
// };

describe('User authentication', () => {

  // Test case: Register a new user
  it('should register a new user', async () => {
    const registerRes = await request(server)
      .post('/api/user/register')
      .send({
        username: 'New User',
        email: 'newuser@example.com',
        password: 'Password123',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('success', true);
    expect(registerRes.body).toHaveProperty('message', 'User registered. Please check your email for confirmation link.');
  });

  // Test case: Confirm email
  it('should confirm email', async () => {
    const user = await User.create({
      username: 'UserForEmailConfirmation',
      email: 'userforemailconfirmation@example.com',
      password: 'UserPassword123',
      isEmailConfirmed: false,
    });
    
    const emailConfirmationToken = user.generateEmailConfirmationToken();
    await user.save();    

    const confirmEmailRes = await request(server).get(`/api/user/confirm-email/${encodeURIComponent(emailConfirmationToken.toString())}`);

    expect(confirmEmailRes.status).toBe(200);
    expect(confirmEmailRes.body).toHaveProperty('success', true);
    expect(confirmEmailRes.body).toHaveProperty('message', 'Email confirmed');
  });

  // Test case: Login user
  it('should login user', async () => {
    const loginRes = await request(server)
      .post('/api/user/login')
      .send({
        email: testUserEmail,
        password: testUserPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('success', true);
    expect(loginRes.body).toHaveProperty('token');
  });

  // Test case: Logout user
  it('should logout user', async () => {
    const user = await User.findOne({ email: testUserEmail });
    const token = await user.generateAuthToken();
    await user.save();

    const logoutRes = await request(server)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty('success', true);
    expect(logoutRes.body).toHaveProperty('message', 'Logged out successfully');
  });

  it('should send forgot password email', async () => {
    const res = await request(server)
      .post('/api/user/forgotpassword')
      .send({
        email: testUserEmail,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data', 'Email sent');
  });

  it('should reset the password', async () => {
    const userEmail = testUserEmail;
    const user = await User.findOne({ email: userEmail });

    // Generate a reset token and its hashed version
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set the reset token and its expiration time on the user
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    const newPassword = 'newPassword123';
    const url = `/api/user/resetpassword/${resetToken}`;
    const resetRes = await request(server)
      .put(url)
      .send({ password: newPassword }); // Change this line

    expect(resetRes.status).toBe(200);
    expect(resetRes.body).toHaveProperty('success', true);
    expect(resetRes.body).toHaveProperty('message', 'Password updated successfully');
  });

  // Test case: Delete user
  it('should delete user', async () => {
    // Log in the user to get the token
    const loginRes = await request(server)
      .post('/api/user/login')
      .send({
        email: testUserEmail,
        password: testUserPassword,
      });
  
    const token = loginRes.body.token;
  
    // Delete the user
    const deleteRes = await request(server)
      .delete('/api/user/delete-profile') 
      .set('Authorization', `Bearer ${token}`);
  
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('success', true);
    expect(deleteRes.body).toHaveProperty('message', 'User deleted successfully');
  });  

});

// describe('Product routes', () => {
//   it('should get all products', async () => {
//     const res = await request(server).get('/api/products');

//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('success', true);
//     expect(res.body).toHaveProperty('data');
//   });

//   it('should get a product by ID', async () => {
//     // You should create a product in the database and use its ID here.
//     const productId = 'some_product_id';

//     const res = await request(server).get(`/api/products/${productId}`);

//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('success', true);
//     expect(res.body).toHaveProperty('data');
//   });
// });

// describe('Wishlist routes', () => {
//   // Assuming you have a product in your database
//   const productId = 'some_product_id';

//   it('should add product to wishlist', async () => {
//     const token = await loginUserAndGetToken();
  
//     const res = await request(server)
//       .post(`/api/wishlist/${productId}`)
//       .set('Authorization', `Bearer ${token}`);
  
//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('success', true);
//     expect(res.body).toHaveProperty('message', 'Product added to wishlist');
//   });
  
//   it('should get wishlist', async () => {
//     const token = await loginUserAndGetToken();
  
//     const res = await request(server)
//       .get('/api/wishlist')
//       .set('Authorization', `Bearer ${token}`);
  
//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('success', true);
//     expect(res.body).toHaveProperty('data');
//   });
  
//   it('should remove product from wishlist', async () => {
//     const token = await loginUserAndGetToken();
  
//     const res = await request(server)
//       .delete(`/api/wishlist/${productId}`)
//       .set('Authorization', `Bearer ${token}`);
  
//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('success', true);
//     expect(res.body).toHaveProperty('message', 'Product removed from wishlist');
//   });
  
//   it('should clear wishlist', async () => {
//     const token = await loginUserAndGetToken();
  
//     const res = await request(server)
//       .delete('/api/wishlist')
//       .set('Authorization', `Bearer ${token}`);
  
//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('success', true);
//     expect(res.body).toHaveProperty('data');
//     expect(res.body.data).toHaveLength(0);
//   });
  
// });