//handle all of the query functions to the given database
const database = require('./index');

//set up object holding all query functions
const users = 
{
    //retrieve user data into a single object, holding ALL data
    getByUsername(username) 
    {
        return database.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
    },


    //this would get called whenever a user makes a request to join the service
    insertRequestData(username, email, optionalRequest, tempPassword)
    {
        return database.prepare(`
            INSERT INTO users (username, email, status, reasonForRequest, password_hash, hasDefaultPwd) VALUES (?, ?, ?, ?, ?, ?)
            `).run(username, email, 'pending', optionalRequest, tempPassword, 1);
    },

    
    //this is a helper function for updating if a user is validated
    updateStatus(username, status)
    {
        return database.prepare(`UPDATE users SET status = ? WHERE username = ?`).run(status, username);
    },


    //important as it would be used for setting the default password as well as the user's actual password
    setPassword(username, pwd_hash, hasDefaultPwd)
    {
        return database.prepare(`
            UPDATE users SET password_hash = ?, hasDefaultPwd = ? WHERE username = ?
            `).run(pwd_hash, hasDefaultPwd, username);
    },


    //get user object by their numeric ID
    getByID(id) 
    {
        return database.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
    }

    
    //TODO: maybe add in some delete stuff or something here if I ever add in an /admin page or someshit
}

module.exports = users;
