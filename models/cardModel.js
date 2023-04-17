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
            if (game.player.state.name == "Waiting") {
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

                // let maxPosition = await pool.query(`Select max(ugh_position) from user_game_hand`)

                // await pool.query(`Insert into user_game_hand (ugh_position, ugh_card_id) values (?, ?)`, [maxPosition, randomCard]);
            }

            return { status: 200, result: { msg: "You drew a card." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async playCard(game, boardPosID, body) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play a card since you are not currently on your turn."
                    }
                }
            }
            else {

                    // let [dbDeckCards] = await pool.query(`Select * from card
                    // inner join user_game_card on ugc_crd_id = crd_id
                    // where ugc_user_game_id = ? and 
                    // crd_id = ? and ugc_state_id = 1`, [game.player.id, cardID]);

                    // if (dbDeckCards.length == 0) {
                    //     return {status:404, result:{msg:"Card not found for this player or not in hand"}};
                    // }

                    // let card = fromDBCardToCard(dbDeckCards[0]);
                    let [[cardID]] = await pool.query(`Select ugc_crd_id as "ID" from user_game_card where ugc_id = ?`, [body.selectedCard]);

                    if (!cardID) {
                        return {status:404, result:{msg:"Please select a valid card."}};
                    }

                    let [[cardType]] = await pool.query(`Select crd_type_id from card where crd_id = ugc_crd_id = ?`, [cardID]);
                    // let [[ugID]] = await pool.query(`Select ug_id from user_game where ug_id = ?`, [game.player.id]);
                    
                    await pool.query(`Insert into user_game_board (ugb_card_id, ugb_position, ugb_ug_id) values (?, ?, ?)`, [cardID, boardPosID, game.player.id]);
                    await pool.query(`Delete from user_game_card where ugc_id = ?`, [body.selectedCard]);
                    // await pool.query(`Update user_game_card set ugc_state_id = 2 where ugc_crd_id = ?`, [cardID]);

                }
                return {status:200, result: {msg: "Card played!"}};

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