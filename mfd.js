const Discord = require('discord.js');
const fs = require('fs')

const bot = new Discord.Client();

const PRE = "!"

ERROR_MESSAGE = "Usage: \n" +
                "  `!roll` - roll 4dF \n" +
                "  `!roll N` - roll 4dF and add N, if N is an integer. \n" +
                "  `!roll XdY` roll X Y-sided dice and report the total."

bot.on('ready', () => {
    console.log("I'm ready to roll!");
});

function isNatural(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}

function rollFudgeDice() {
    arr = []
    for (var i = 0; i < 4; i++) {
        arr.push(3 * Math.floor((Math.random() * 3) - 1)); 
    }
    return arr;
}

function rollDiceCode(num_and_faces) {
    num = num_and_faces[0]
    faces = num_and_faces[1]

    arr = []
    for (var i = 0; i < num_and_faces[0]; i++) {
        arr.push(1 + Math.floor(Math.random() * faces));
    }
    return arr;
}

function stringifyDice(dice) {
    total = 0;
    dice_str = "";
    for (var i = 0; i < dice.length; i++) {
        total += dice[i];
        dice_str += `(${dice[i]}) + `;
    }
    dice_str = dice_str.slice(0, -3);
    dice_str += ` = **${total}**`;
    return dice_str;
}

function getNumAndFaces(dice_str) {
    num_and_faces = dice_str.split('d');
    if (num_and_faces.length !== 2) {
        return null;
    }
    num = num_and_faces[0];
    faces = num_and_faces[1];
    if (!isNatural(num) || !isNatural(faces)) {
        return null;
    }
    return [parseInt(num), parseInt(faces)]
}


bot.on('message', msg => {
    if (msg.content[0] !== "!") {
        return;
    }
    let args = msg.content.substring(PRE.length).split(" ");
    switch (args[0]) {
        case 'r':
        case 'roll':
            switch (args.length) {
                case 1:
                    dice = rollFudgeDice()
                    sum = dice.reduce((a, b) => a+b);
                    msg.channel.send(stringifyDice(dice, sum));
                    break;
                case 2:
                    if (isNatural(args[1])) {
                        dice = rollFudgeDice();
                        sum = dice.reduce((a, b) => a+b);
                        tot = parseInt(args[1]) + sum;
                        msg.channel.send(`Dice: ${stringifyDice(dice)} \n`+
                                         `Total: ${args[1]} + ${sum} = **${tot}**`);
                    }
                    else {
                        num_and_faces = getNumAndFaces(args[1]);
                        if (num_and_faces === null) {
                            msg.channel.send(ERROR_MESSAGE);
                            break;
                        }
                        dice = rollDiceCode(num_and_faces)
                        msg.channel.send(`Dice: ${stringifyDice(dice)}`)
                    }
                    break;
                default:
                    msg.channel.send(ERROR_MESSAGE);
                }
            break;
        case 'help':
        case 'info':
            msg.channel.send(ERROR_MESSAGE);
            break;
    }
});

fs.readFile('token.txt', 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }
    else {
        const token = data.replace('\n', '');
        bot.login(token);
    }
});