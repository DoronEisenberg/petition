const supertest = require("supertest");

const app = require("../../server");

describe('Test example', () => {
it('renders the home page', () => {
    return supertest(app)
    .get("/petition")
    .then((res) +> {
        
    })

});


/*to run it in the terminal: with npm run test*/