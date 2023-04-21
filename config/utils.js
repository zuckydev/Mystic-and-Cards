module.exports.genToken = function genToken(length) {
   let token = '';
   let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for (let i = 0; i < characters.length; i++) {
       token += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return token;
}

module.exports.randomNumber = function randomNumber(maxN) {
    let randomNumber = Math.floor(Math.random() * maxN);
    return randomNumber;
}

module.exports.maxHP = 50;
module.exports.goldPerTurn = 5;
module.exports.nCards = 3;