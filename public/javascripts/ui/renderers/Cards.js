class Card {
    static width = 150;
    static height = 200;
    static titleTextSize = 12;
    static infoTextSize = 23;
    static bgColor = [
        [91, 255, 129, 255], // Common
        [173, 91, 255, 255], // Epic
        [255, 194, 91, 255] // Legendary
    ]
    static cardType = [
        "Monster",
        "Shield",
        "Spell"
    ]
    
    constructor(id, name, rarity, type, state, position, img) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.type = type;
        this.state = state;
        this.position = position;
        this.img = img;
    }

    draw(x, y) {
        this.x = x;
        this.y = y;
        image(this.img, this.x, this.y, Card.width, Card.height);
        // fill(
        //     Card.bgColor[this.rarity - 1][0], // Red
        //     Card.bgColor[this.rarity - 1][1], // Green
        //     Card.bgColor[this.rarity - 1][2], // Blue
        //     Card.bgColor[this.rarity - 1][3]  // Alpha
        // );

        // rect(
        //     x,
        //     y,
        //     Card.width,
        //     Card.height
        // );

        fill('white');
        textFont(GameInfo.fonts.CardFont);
        textSize(Card.titleTextSize);
        textAlign(CENTER, CENTER);
        textSize(15);
        text(this.name, x, y + 125, Card.width, Card.height * 0.25);
        // rect(x + 10, y + 30, Card.width - 20, 2);
        textSize(19);
        text(Card.cardType[this.type - 1], x - 25, y + 100, Card.width, 30);

    }

    click() {
        return mouseX > this.x && mouseX < this.x + Card.width &&
               mouseY > this.y && mouseY < this.y + Card.height;
    }
}

class MonsterCard extends Card {
    constructor(id, name, rarity, type, state, position, img, hp, attack) {
        // Call the constructor of the Card class
        super(id, name, rarity, type, state, position, img);
        // Save data specific to Monster Card
        this.hp = hp;
        this.attack = attack;
    }

    draw(x, y) {
        super.draw(x, y);
        textSize(Card.infoTextSize);
        text(`HP: ${this.hp}`, x, y  + (Card.height * 0.5), Card.width, Card.height * 0.5);
        text(`Attack: ${this.attack}`, x, y  + (Card.height * 0.65), Card.width, Card.height * 0.4);
    }
}

class ShieldCard extends Card {
    constructor(id, name, rarity, type, state, position, img, hp) {
        super(id, name, rarity, type, state, position, img)
        this.hp = hp;
    }
    
    draw(x, y) {
        super.draw(x, y);
        textFont(GameInfo.fonts.CombatFont);
        textSize(Card.infoTextSize);
        text(this.hp, x + 42, y  + 65, Card.width, Card.height * 0.5);
    } 
    
}

class SpellCard extends Card {
    constructor(id, name, rarity, type, state, position, img, attack) {
        super(id, name, rarity, type, state, position, img)
        this.attack = attack;
    }
    
    draw(x, y) {
        super.draw(x, y);
        textSize(Card.infoTextSize);
        text(`Attack: ${this.attack}`, x, y  + (Card.height * 0.6), Card.width, Card.height * 0.4);
    }
}

class PlayerHand {
    static nCards = 5;
    static titleHeight = 50;

    constructor(title, cardsInfo, x, y, clickAction, cardSpacing) {

        this.title = title;
        this.x = x;
        this.y = y;
        this.width = Card.width * PlayerHand.nCards;
        this.clickAction = clickAction;
        this.cardSpacing = cardSpacing;
        this.scale = scale;
        this.cards = this.createCards(cardsInfo);
    }
    
    createCards(cardsInfo) {
        let cards = [];
        for (let cardInfo of cardsInfo) {
            
            if (cardInfo.type == 1) {
                cards.push(new MonsterCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position, GameInfo.images.Fireball, cardInfo.hp, cardInfo.attack));
            }
            else if (cardInfo.type == 2) {
                cards.push(new ShieldCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position, GameInfo.images.Fireball, cardInfo.hp));
            }
            else if (cardInfo.type == 3) {
                cards.push(new SpellCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position, GameInfo.images.Fireball, cardInfo.attack));
            }
        }
        return cards;
    }
    
    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }

    draw() {
        textSize(28);
        textAlign(CENTER, CENTER);
        // text(this.title, this.x, this.y, this.width, 400);
        let x = 400;
        for (let card of this.cards) {
            card.draw(x, this.y);
            x += (Card.width + this.cardSpacing);
        }
    }

    click() {
        if (this.clickAction) {
            for (let card of this.cards) {
                if (card.click()) {
                    this.clickAction(card);
                }
            }
        }
    }
}

class PlayerBoard extends PlayerHand {
    constructor(title, cardsInfo, x, y, clickAction, cardSpacing) {
        super(title, cardsInfo, x, y, clickAction, cardSpacing);
    }
    
    draw() {
        textSize(28);
        textAlign(CENTER, CENTER);
        // drawing cards
        let x = 550;
        for (let card of this.cards) {
            console.log(card.position)
            if (card.position == 1) {
                // x = 400;
                card.draw(x, this.y);
            } else if (card.position == 2) {
                x += Card.width + 10;
                card.draw(x, this.y);
            } else if (card.position == 3) {
                x += (Card.width * 2) + 10;
                card.draw(x, this.y);
            }
            // x += (Card.width * card.position) + this.cardSpacing;
            
            // card.draw(x, this.y);
        }

        // drawing the board
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        // stroke (0, 0, 0);
        // strokeWeight (4);
        
        ctx.strokeRect(500, 220, Card.width, Card.height);
        // stroke();
        // line (500, 220, 500, 560);
        line (740, 220, 740, 560);
        line (620, 220, 620, 560); 
        line (500, 560, 860, 560);
        line (860, 220, 860, 560);
        line (500, 380, 860, 380);
        line (500, 400, 860, 400);
        line (500, 220, 860, 220);
        strokeWeight (1);
        stroke (0, 0, 0);
    }
}

class OppCard {
    static width = 80;
    static height = 130;
    static bgColor = [
        [91, 255, 129, 255], // Common
        [173, 91, 255, 255], // Epic
        [255, 194, 91, 255] // Legendary
    ]
    
    constructor(id, name, rarity, type, state) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.type = type;
        this.state = state;
    }

    draw(x, y) {
        fill(
            Card.bgColor[this.rarity - 1][0], // Red
            Card.bgColor[this.rarity - 1][1], // Green
            Card.bgColor[this.rarity - 1][2], // Blue
            Card.bgColor[this.rarity - 1][3]  // Alpha
        );

        rect(
            x,
            y,
            Card.width,
            Card.height
        );

    }
}

class OppHand {
    static nCards = 5;
    static titleHeight = 50;

    constructor(title, cardsInfo, x, y) {
        this.title = title;
        this.x = x;
        this.y = y;
        this.width = OppCard.width * OppHand.nCards;
        this.cards = this.createCards(cardsInfo);
    }

    createCards(cardsInfo) {
        let cards = [];
        for (let cardInfo of cardsInfo) {
            cards.push(new OppCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.position));
        }
        return cards;
    }
    
    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }

    draw() {
        textSize(28);
        textAlign(CENTER, CENTER);
        // text(this.title, this.x, this.y, this.width, 400);
        let x = 400;
        for (let card of this.cards) {
            card.draw(x, 25);
            x += OppCard.width;
        }
    }
}