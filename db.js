const spicedPg = require("spiced-pg");
const { query } = require("express");
const bcrypt = require("bcryptjs");

//const user = "postgres";
const { POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_NAME } = process.env;

//console.log("USER ", POSTGRES_USER, " password ", POSTGRES_PASSWORD);
// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(
    `postgres:${POSTGRES_USER}:${POSTGRES_PASSWORD}:@localhost:5432/${DATABASE_NAME}`
);

db.query(`SELECT * FROM signatures`)
    .then(function (result) {
        //console.log(result.rows);
    })

    .catch(function (err) {
        //console.log(results.err, "error");
    });

module.exports.insertSigner = ({ user_id, signature }) => {
    return db
        .query(
            `INSERT INTO signatures (user_id, signature)
    VALUES ($1, $2)
    RETURNING *`,
            [user_id, signature]
        )
        .then((result) => {
            result.rows[0];
            console.log("test", result.rows[0]);
        });
};

module.exports.registerSigner = ({ firstname, lastname, email, password }) => {
    const hash = bcrypt.hashSync(password, 10);
console.log("is it hashed: " + hash, firstname, lastname, email, password)
    return db
        .query(
            `INSERT INTO users (firstname, lastname, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
            [firstname, lastname, email, hash]
        )
        .then(function (result) {
            return result.rows[0];
        });
};

module.exports.addInformation = ({ age, city, url }) => {
    console.log("More Information: " + age, city, url)
    return db
        .query(
            `INSERT INTO more_information (age, city, url)
    VALUES ($1, $2, $3)
    RETURNING *`,
            [age, city, url]
        )
        .then(function (result) {
            return result.rows[0];
        });
}

module.exports.getMoreInfo = () => {
    return db
        .query(
            `SELECT users.firstname AS firstname, users.lastname AS lastname, users.email AS email, users.password AS password, more_information.age AS age, more_information.city AS city, more_information.url AS url 
            FROM users 
            JOIN more_information 
            ON users.id = more_information.user_id`
        )
        .then((result) => result.rows[0]);
}
console.log("getMoreInfo");

module.exports.collectSigners = (res) => {
    return db.query(`SELECT * FROM users`).then(function (result) {
        console.log("test", result);
        return result.rows;
    });
};
function findUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email=$1", [email])
        .then((results) => {
            if (results.rows.length == 0) {
                throw new Error("email does not exist");
            }
            return results.rows[0];
        })
        .catch((err) => console.log(err));
    }

module.exports.authenticateUser = ({ email, password }) => {
    return findUserByEmail(email).then((user) => {
        if (!bcrypt.compareSync(password, user.password)) {
            throw new Error("password incorrect");
        }
        return user;
    });
};
