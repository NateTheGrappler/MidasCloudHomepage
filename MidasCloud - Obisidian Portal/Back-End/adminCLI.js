//a quick tool not exposed to the rest of the app to basically just make it easier to edit the database
//and actually approve pending users after they have been allocated a vault container on the server
const readline = require('readline/promises');
const {stdin, stdout} = require('process');
const users = require('./databases/users')


async function runAdminCLI()
{
    //set up CLI
    const rLine = readline.createInterface({input: stdin, output: stdout});
    const pending = users.getAllPending();

    //check to see if you got users pendin
    if(pending.length === 0)
    {
        console.log("There are no pending users in database.");
        rLine.close();
        return;
    }


    //otherwise, for each of the ones, print them out
    for(const user of pending)
    {
        console.log(`\nUsername: ${user.username}\n Email: ${user.email}\n Reason: ${user.reasonForRequest || 'No Reason was Provided By User'}`)

        //get the decision to approve or dissaprove from the admin
        const choice = await rLine.question('Approve this user? (y/n/skip): ')

        //check what got inputted
        if(choice.toLowerCase() === 'y')
        {
            //approve user and ask for vault link entry
            const vaultLink = await rLine.question('Enter Vault Link for this User: ');
            users.updateStatus(user.username, 'approved');
            users.updateVaultLink(user.username, vaultLink);
            console.log(`Approved new User: ${user.username}, new vault located at: ${vaultLink}`)
        }
        else if (choice.toLowerCase() === 'n')
        {
            //do not approve of the user
            users.updateStatus(user.username, 'denied');
            console.log(`Denied User: ${user.username}`)
        }
        else
        {
            //change nothing and skip user
            console.log(`User: ${user.username} was skipped.`);
        }
    }

    //cleanup
    rLine.close();
}


//run the program
runAdminCLI();