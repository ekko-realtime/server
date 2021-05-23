const request = require("supertest");
const app = require("./ekko.js");

beforeAll((done) => {
  done();
});

afterAll((done) => {
  done();
});

describe("Test the root path", () => {
  test("It should response the GET method", async (done) => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    done();
  });
});

describe("Test put associations", () => {
  const secretKey = "secret";
  const payload = {
    secretKey,
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBsaWNhdGlvbnMiOnsiZGVtbyI6eyJjaGFubmVscyI6W3siY2hhbm5lbE5hbWUiOiJncmVldGluZyIsImZ1bmN0aW9uTmFtZXMiOlsiZGVtby1jYXBpdGFsaXplIl19XX19fQ.03K7HOvLWAKWZDcpNZLO5iEMy54S-9BfLv8R6K4EoX0",
  };
  test("It should validate associations.json", async (done) => {
    const response = await request(app).put("/associations").send(payload);
    expect(response.statusCode).toBe(200);
    done();
  });
});
