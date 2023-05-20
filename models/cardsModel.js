const pool = require("../config/database");
const utils = require("../config/utils");

// function fromDBCardToCard(dbCard) {
//     return new Card(dbCard.crd_id)
// }

class Card {
    constructor(cardId, deckId, name, type, state, userCardHandData) {
        this.cardId = cardId;
        this.deckId = deckId;
        this.name = name;
        this.type = type;
        this.state = state;
        this.userCardHandData = userCardHandData;
    }

    static async drawCard(game, body) {
        try {
            let [[playernCards]] = await pool.query(`Select count(ugc_id) as "num" from user_game_card where ugc_user_game_id = ?`, [game.player.id]);
            let [[playerGold]] = await pool.query(`Select ug_gold as "gold" from user_game where ug_id = ?`, [game.player.id]);
            let [[cost]] = await pool.query(`Select rar_cost as "cost" from rarity where rar_id = ?`, [body.rarity]);
            
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                        "You cannot draw card since you are not currently on your turn."
                    }
                }
            }
            else if (playernCards.num > 5) {
                return {
                    status: 400, result: {
                        msg:
                            "You already drew the maximum amount of cards."
                        }
                    }
                }
            else if (playerGold.gold < cost.cost)
            {
                return {
                    status: 400, result: {
                        msg:
                        "You do not have enough gold to draw this card."
                    }
                }
            }
            
                else {
                    // Ajusts player gold
                    playerGold.gold -= cost.cost;
                    await pool.query(`Update user_game 
                    set ug_gold = ? 
                    where ug_id = ?`, 
                        [playerGold.gold, game.player.id]);

                    // Selects all cards from that rarity
                    let [cards] = await pool.query(
                    `select * from card where crd_rarity = ?`,
                    [body.rarity]);

                    // Selects random card from the array
                    let randomCard = cards[utils.randomNumber(cards.length)];
                    console.log(randomCard);
                    
                    // Add new card to user game card
                    await pool.query(
                    `Insert into user_game_card
                    (ugc_user_game_id, ugc_crd_id, ugc_state_id)
                    values (?, ?, 1)`,
                        [game.player.id, randomCard.crd_id]);

                    // Getting the newly created user card id 
                    let [[userCardData]] = await pool.query(
                        `Select max(ugc_id) as "maxID"
                        from user_game_card 
                        where ugc_user_game_id = ?`,
                            [game.player.id]);

                    let [[cardType]] = await pool.query(
                        `Select crd_type_id as "type" from card, user_game_card
                        where crd_id = ugc_crd_id and ugc_id = ?`,
                            [userCardData.maxID]);

                    // Add the newly created card to the hand
                    await pool.query(
                        `Insert into user_game_hand
                        (ugh_ugc_id) values (?)`,
                            [userCardData.maxID]);

                    if (cardType.type == 1) {
                        let [[cardDataDB]] = await pool.query(
                        `Select ctk_hp as "hp", ctk_attack "attack" from card_attack, user_game_card
                        where ugc_crd_id = ctk_crd_id and ugc_id = ?`,
                            [userCardData.maxID]);

                        // await pool.query(`
                        // Insert into user_game_card_attack
                        // (uca_ugc_id, uca_hp, uca_ap) values (?, ?, ?)`,
                        //     [userCardData.maxID, cardDataDB.hp, cardDataDB.attack]);
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
            let [[cardInPlace]] = await pool.query(`
            Select * from user_game_board 
            where ugb_ug_id = ? and ugb_position = ?`, 
            [game.player.id, boardPos]);
            
            [[this.userCardHandData]] = await pool.query(`
                Select ugh_ugc_id as "id" 
                from user_game_hand where ugh_id = ?`, 
                    [cardID]);

            let [[cardData]] = await pool.query(`
            Select ugc_crd_id as "id"
            from user_game_card where ugc_id = ?`,
                [this.userCardHandData.id]);

            if (!cardData) {
                return {status:404, result:{msg:"Please select a valid card."}};
            }

            let [[cardType]] = await pool.query(`
                Select crd_type_id as "typeID" 
                from card, user_game_card 
                where crd_id = ugc_crd_id and ugc_crd_id = ?`, 
                    [cardData.id]);

            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play a card since you are not currently on your turn."
                    }
                }
            }
            else if (cardInPlace && cardType.typeID == 1) {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play a card in this position."
                    }
                }
            }
            else {

                    // changes state of the card to on-hand
                    await pool.query(`Update user_game_card set ugc_state_id = 2 where ugc_id = ?`, [cardID]);

                    // monster card
                    if (cardType.typeID === 1) {
                        await this.cardToBoard(cardID, boardPos, game);

                        let [[cardInfo]] = await pool.query(`
                        Select distinct(ctk_attack) as "ap", ctk_hp as "hp" 
                        from card_attack, user_game_card
                        where ctk_crd_id = ugc_crd_id and ugc_id = ?`, 
                            [cardID]);
                    
                        await pool.query(`
                        Insert into user_game_card_attack
                        (uca_ugc_id, uca_hp, uca_ap) 
                        values (?, ?, ?)`, 
                            [cardID, cardInfo.hp, cardInfo.ap]);
                    }
                    else if (cardType.typeID === 2) {
                        await this.cardShield(cardID, boardPos, game)
                    }
                    // spell card
                    else if (cardType.typeID === 3) {
                        await this.cardSpell(cardID, boardPos, game);
                    }
                    
                    await pool.query(`Delete from user_game_hand where ugh_id = ?`, [cardID]);

                }
                return {status:200, result: {msg: "Card played!"}};

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async cardToBoard(cardID, boardPos, game) {
        
        await pool.query(`
        Insert into user_game_board
        (ugb_ugc_id, ugb_position, ugb_ug_id)
        values (?, ?, ?)`, 
            [cardID, boardPos, game.player.id]);
    }

    static async cardAttack(cardID, boardPos, opponents) {
        
        for (let i = 0; i < opponents.length; i++) {

            let [[attackPower]] = await pool.query(`
            Select uca_ap as "ap" 
            from user_game_card_attack 
            where uca_ugc_id = ?`, 
                [cardID]);

            let [[cardInFront]] = await pool.query(`
            Select ugb_ugc_id as "ugcID" 
            from user_game_board 
            where ugb_ug_id = ? and ugb_position = ?`, 
                [opponents[i].id, boardPos]);
                
            if (!cardInFront) {
                let [[oppHP]] = await pool.query(`
                Select ug_hp as "hp" from user_game 
                where ug_id = ?`, 
                    [opponents[i].id]);

                oppHP.hp -= attackPower.ap;
                await pool.query(`Update user_game set ug_hp = ? where ug_id = ?`, [oppHP.hp, opponents[i].id]);
            } else {
                    
                let [[cardInFrontData]] = await pool.query(`Select uca_hp as "hp" 
                from user_game_card_attack where uca_ugc_id = ?`,
                    [cardInFront.ugcID]);

                cardInFrontData.hp -= attackPower.ap;
                
                if (cardInFrontData.hp > 0) {
                    await pool.query(`
                    Update user_game_card_attack 
                    set uca_hp = ? 
                    where uca_ugc_id = ?`,
                        [cardInFrontData.hp, cardInFront.ugcID]);
                }
                else {
                    // adds the card to the discard table
                    await pool.query(`
                    Insert into user_game_discard
                    (ugd_ugc_id) 
                    value (?)`, 
                        [cardInFront.ugcID]);

                    // deletes it from the board table
                    await pool.query(`Delete from user_game_board 
                    where ugb_ugc_id = ?`, 
                        [cardInFront.ugcID]);
                }
            }
        }
    }

    static async cardSpell(cardID, boardPos, game) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play this card since you are not currently on your turn."
                    }
                }
            } else {
                let[[buffedCard]] = await pool.query(`
                Select ugb_ugc_id as "ugcID"
                from user_game_board
                where ugb_position = ? 
                and ugb_ug_id = ?`, 
                    [boardPos, game.player.id]);

                    if (!buffedCard) {
                        return {
                            status: 400, result: {
                                msg:
                                    "Please choose a valid card."
                            }
                        }
                    }
                    else {

                        // needs optimization
                        let [[ugcID]] = await pool.query(`
                        Select ugh_ugc_id as "id" from user_game_hand
                        where ugh_id = ?`, 
                            [cardID]);

                        let [[crdID]] = await pool.query(`
                        Select ugc_crd_id as "id" from user_game_card
                        where ugc_id = ?`, 
                            [ugcID.id]);

                        let [[buff]] = await pool.query(`
                        Select csp_attack 
                        from card_spell 
                        where csp_crd_id =  ?`, 
                            [crdID.id]);

                        let [[buffedCardData]] = await pool.query(`
                        Select distinct uca_ap as "ap" from user_game_card_attack where uca_ugc_id = ?`,
                            [buffedCard.ugcID]);

                        buffedCardData.ap += buff.csp_attack;
                        
                        await pool.query(`Update user_game_card_attack set uca_ap = ? where uca_ugc_id = ?`,
                            [buffedCardData.ap, buffedCard.ugcID]);
                    }

            }
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async cardShield(cardID, boardPos, game) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play this card since you are not currently on your turn."
                    }
                }
            } else {
                let[[healedCard]] = await pool.query(`
                Select ugb_ugc_id as "ugcID"
                from user_game_board
                where ugb_position = ? 
                and ugb_ug_id = ?`, 
                    [boardPos, game.player.id]);

                    if (!healedCard) {
                        return {
                            status: 400, result: {
                                msg:
                                    "Please choose a valid card."
                            }
                        }
                    }
                    else {
                        let [[ugcID]] = await pool.query(`
                        Select ugh_ugc_id as "id" from user_game_hand
                        where ugh_id = ?`, 
                            [cardID]);

                        let [[crdID]] = await pool.query(`
                        Select ugc_crd_id as "id" from user_game_card
                        where ugc_id = ?`, 
                            [ugcID.id]);

                        let [[heal]] = await pool.query(`
                            Select csh_hp as "hp" from card_shield where csh_crd_id = ?`,
                                [crdID.id]);

                        let [[healedCardData]] = await pool.query(`
                            Select distinct uca_hp as "hp" from user_game_card_attack where uca_ugc_id = ?`,
                                [healedCard.ugcID]);

                        healedCardData.hp += heal.hp;

                        await pool.query(`
                        Update user_game_card_attack
                        set uca_hp = ? where uca_ugc_id = ?`,
                            [healedCardData.hp, healedCard.ugcID]);
                    }
            }
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
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
    //         (err);
    //         return { status: 500, result: err };
    //     }
    // }
}

module.exports = Card;