const pool = require("../config/database");
const utils = require("../config/utils");

// function fromDBCardToCard(dbCard) {
//     return new Card(dbCard.crd_id)
// }

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
                // Selects all cards from that rarity
                let [cards] = await pool.query(
                    `select * from card where crd_rarity = ?`,
                        [body.rarity]);

                // Selects random card from the array
                let randomCard = utils.randomNumber(cards.length);

                // Add new card to user game card
                await pool.query(
                    `Insert into user_game_card
                    (ugc_user_game_id, ugc_crd_id, ugc_state_id)
                    values (?, ?, 1)`,
                        [game.player.id, randomCard]);

                // let [[hp]] = await pool.query(`Select `)

                // Getting the newly created user card id 
                let [[userCardData]] = await pool.query(
                    `Select max(ugc_id) as "maxID"
                    from user_game_card 
                    where ugc_user_game_id = ?`,
                        [game.player.id]);

                let [[cardType]] = await pool.query(
                    `Select crd_type_id from card, user_game_card
                    where crd_id = ugc_crd_id and ugc_id = ?`,
                        [userCardDate.maxID]);

                // Add the newly created card to the hand
                await pool.query(
                    `Insert into user_game_hand
                    (ugh_ugc_id) values (?)`,
                        [userCardData.maxID]);

                if (cardType == 1) {
                    let [[cardHP]] = await pool.query(
                    `Select ctk_hp from card_attack, user_game_card
                    where ugc_crd_id = ctk_crd_id and ugc_id = ?`,
                        [userCardData.maxID]);

                    await pool.query(`
                    Insert into user_game_card_attack
                    (uca_ugc, uca_hp) values (?, ?)`,
                        [userCardData.maxID, cardHP]);
                }
            }
            return { status: 200, result: { msg: "You drew a card." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async playCard(game, cardID, boardPos) {
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
                    let [[cardData]] = await pool.query(`Select ugc_crd_id as "ID" from user_game_card where ugc_id = ?`, [cardID]);

                    if (!cardData) {
                        return {status:404, result:{msg:"Please select a valid card."}};
                    }

                    let [[cardType]] = await pool.query(`Select crd_type_id from card where crd_id = ugc_crd_id and ugc_crd_id = ?`, [cardData.ID]);
                    // let [[ugID]] = await pool.query(`Select ug_id from user_game where ug_id = ?`, [game.player.id]);
                    
                    await pool.query(`Insert into user_game_board (ugb_card_id, ugb_position, ugb_ug_id) values (?, ?, ?)`, [cardID, boardPos, game.player.id]);
                    await pool.query(`Delete from user_game_card where ugc_id = ?`, [cardData]);
                    // await pool.query(`Update user_game_card set ugc_state_id = 2 where ugc_crd_id = ?`, [cardID]);

                }
                return {status:200, result: {msg: "Card played!"}};

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async cardAttack(card1, card2) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play this card since you are not currently on your turn."
                    }
                }
            } else {
                let [[cardID]] = await pool.query(`Select ugb_card_id from user_game_board where `);
                let [[AP]] = await pool.query(`Select ctk_attack from card_attack where ctk_crd_id = ?`, [card1.id]);
            }
        } catch (error) {
            
        }
    }

    static async cardSpell(card, oppBoard) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play this card since you are not currently on your turn."
                    }
                }
            } else {

            }
        } catch (error) {
            
        }
    }

    static async cardShield(card) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play this card since you are not currently on your turn."
                    }
                }
            } else {

            }
        } catch (error) {
            
        }
    }
}

class MatchDecks {
    constructor(myCards, oppCards) {
        this.myCards = myCards;
        this.oppCards = oppCards;
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
    
    // static async getMatchDeck(game) {
    //     try {
    //         let [dbcards] = await pool.query(`Select * from user_game_card
    //         where `, 
    //             [game.player.id, game.opponents[0].id]);
    //         let playerCards = [];
    //         let oppCards = [];
    //         for(let dbcard of dbcards) {
    //             let card = fromDBCardToCard(dbcard);
    //             if (dbcard.ugc_user_game_id == game.player.id) {
    //                 playerCards.push(card);
    //             } else {
    //                 oppCards.push(card);
    //             }
    //         }
    //         return {status:200, result: new MatchDecks(playerCards, oppCards)};
    //     } catch (err) {
    //         console.log(err);
    //         return { status: 500, result: err };
    //     }
    // }
}

module.exports = Card;
// module.exports = MatchDecks;