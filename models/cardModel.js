const pool = require("../config/database");
const utils = require("../config/utils");

function fromDBCardToCard(dbCard) {
    return new Card(dbCard.crd_id)
}

class Card {
    constructor(cardId, deckId, name, type, state) {
        this.cardId = cardId;
        this.deckId = deckId;
        this.name = name;
        this.type = type;
        this.state = state; 
    }

    static async drawCard(game, body) {
        try {
            if (game.player.state.name != "Playing") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot draw card since you are not currently on your turn."
                    }
                }
            }
            else {
                // Draw a card

                // Selects all cards from that rarity
                let [cards] = await pool.query(
                    `select * from card where crd_rarity = ?`,
                    [body.rarity]);

                // Selects random card from the array
                let randomCard = utils.randomNumber(cards.length);

                // Inserts it into user game card
                await pool.query(
                    `Insert into user_game_card (ugc_user_game_id, ugc_crd_id, ugc_state_id) values (?, ?, 1)`,
                        [game.player.id, randomCard]);
            }

            return { status: 200, result: { msg: "You drew a card." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async playCard(cardID) {
        try {
            if (game.player.state.name != "Playing") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play a card since you are not currently on your turn."
                    }
                }
            }
            else {
                await pool.query(`Update user_game_card set ugc_state_id = 2 where ugc_crd_id = ?`, [cardID]);
            }

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async generateCard(playerId, rarity) {
        try { // is used in case any errors appear
            let [cards] = await pool.query(`select * from card where crd_rarity = ?`, [rarity]); // selects all common cards
            let randomCard = fromDBCardToCard(cards[Math.floor(Math.random()*cards.length)]) // picks a random card from the selected cards
            console.log("Card:")
            console.log(randomCard)
            let [result] = await pool.query(
                `Insert into user_game_card (ugc_user_game_id, ugc_crd_id, ugc_state_id) values (?, ?, 1)`,
                    [playerId, randomCard.crd_id]); // inserts into the users game cards table
            return {status: 200, result: randomCard};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err};
        }
        
    }
}

class MatchDecks {
    constructor(mycards,oppcards) {
        this.mycards = mycards;
        this.oppcards = oppcards;
    }

    static async generatePlayerDeck(playerId) {
        try {
            let cards =[]; // creates empty array to store player cards
            for (let i=0; i < Settings.nCards; i++) {
                let result = await Card.genCard(playerId);
                cards.push(result.result);
            }
            return {status:200, result: cards};
        } catch (err) {
            console.log(err);   
            return { status: 500, result: err };
        }
        
    }
    
    static async resetPlayerDeck(playerId) {
            try {
                let [result] = await pool.query(`delete from user_game_card where ugc_user_game_id = ?`, [playerId]);
                return {status:200, result: {msg:"All cards removed"}};
            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
            }
    }
    
    static async getMatchDeck(game) {
        try {
            let [dbcards] = await pool.query(`Select * from card
                inner join card_type on crd_type_id = ct_id 
                inner join user_game_card on ugc_crd_id = crd_id
                where ugc_user_game_id = ? or ugc_user_game_id = ?`, 
                [game.player.id, game.opponents[0].id]);
            let playerCards = [];
            let oppCards = [];
            for(let dbcard of dbcards) {
                let card = fromDBCardToCard(dbcard);
                if (dbcard.ugc_user_game_id == game.player.id) {
                    playerCards.push(card);
                } else {
                    oppCards.push(card);
                }
            }
            return {status:200, result: new MatchDecks(playerCards,oppCards)};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}



module.exports = Card;