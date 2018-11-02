var request = require('supertest');

describe('loading express', function () {
  var server, redirect;
  beforeEach(function () {
    redirect = require('./index.js');
    server = require('express');

    server.use(redirect({
      redirect :
    }))
  });

  afterEach(function () {
    server.close();
  });
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});