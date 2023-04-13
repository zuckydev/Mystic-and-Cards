const pool = require("../config/database");
// const Settings = require("./gameSettings");

function fromDBCardToCard(dbCard) {
    return new Card(dbCard.crd_id)
}

class Card {
    constructor(cardId, deckId, name, type, active) {
        this.cardId = cardId;
        this.deckId = deckId;
        this.name = name;
        this.type = type;

    }

    static async generateCard(playerId, rarity) {
        try { // is used in case any errors appear
            let [cards] = await pool.query(`select * from card where crd_rarity = ?`, [rarity]); // selects all common cards
            let randomCard = fromDBCardToCard(cards[Math.floor(Math.random() * cards.length)]) // picks a random card from the selected cards
            console.log("Card:")
            console.log(randomCard)
            let [result] = await pool.query(
                `Insert into user_game_card (ugc_user_game_id, ugc_crd_id, ugc_state_id) values (?, ?, 1)`,
                [playerId, randomCard.crd_id]); // inserts into the users game cards table
            return { status: 200, result: randomCard };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }

    }

    // static async generateEpicCard(playerId) {
    //     try { // is used in case any errors appear
    //         let [cards] = await pool.query(`select * from card where crd_rarity = 2`); // selects all epic cards
    //         let randomCard = fromDBCardToCard(cards[Math.floor(Math.random()*cards.length)]) // picks a random card from the selected cards
    //         let [result] = await pool.query(`Insert into user_game_card (ugc_user_game_id,ugc_crd_id,ugc_active)
    //         values (?,?,?)`, [playerId,rndCard.cardId,true]); // inserts into the users game cards table
    //         return {status: 200, result: rndCard};
    //     } catch (err) {
    //         console.log(err);
    //         return { status: 500, result: err};
    //     }
    // }

    // static async generateLegendaryCard(playerId) {
    //     try { // is used in case any errors appear
    //         let [cards] = await pool.query(`select * from card where crd_rarity = 3`); // selects all legendary cards
    //         let randomCard = fromDBCardToCard(cards[Math.floor(Math.random()*cards.length)]) // picks a random card from the selected cards
    //         let [result] = await pool.query(`Insert into user_game_card (ugc_user_game_id,ugc_crd_id,ugc_active)
    //         values (?,?,?)`, [playerId,rndCard.cardId,true]); // inserts into the users game cards table
    //         return {status: 200, result: rndCard};
    //     } catch (err) {
    //         console.log(err);
    //         return { status: 500, result: err};
    //     }
    // }
}

class MatchDecks {
    constructor(mycards, oppcards) {
        this.mycards = mycards;
        this.oppcards = oppcards;
    }

    static async generatePlayerDeck(playerId) {
        try {
            let cards = []; // creates empty array to store player cards
            for (let i = 0; i < Settings.nCards; i++) {
                let result = await Card.genCard(playerId);
                cards.push(result.result);
            }
            return { status: 200, result: cards };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }

    }

    static async resetPlayerDeck(playerId) {
        try {
            let [result] = await pool.query(`delete from user_game_card where ugc_user_game_id = ?`, [playerId]);
            return { status: 200, result: { msg: "All cards removed" } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

// to do: finish deck
// draw and play card
// mines
// layout

module.exports = Card;