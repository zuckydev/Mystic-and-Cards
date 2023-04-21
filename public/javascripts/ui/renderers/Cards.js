class Card {
    static width = 80;
    static height = 130;
    static titleTextSize = 12;
    static infoTextSize = 9;
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

        fill(0, 0, 0, 255);
        textSize(Card.titleTextSize);
        textAlign(CENTER, CENTER);
        text(this.name, x, y, Card.width, Card.height * 0.25);
        rect(x + 10, y + 30, Card.width - 20, 2);
        textSize(12);
        text(Card.cardType[this.type - 1], x, y + 30, Card.width, 30);

    }

    click() {
        return mouseX > this.x && mouseX < this.x + Card.width &&
               mouseY > this.y && mouseY < this.y + Card.height;
    }
}

class MonsterCard extends Card {
    constructor(id, name, rarity, type, state, hp, attack) {
        // Call the constructor of the Card class
        super(id, name, rarity, type, state);
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
    constructor(id, name, rarity, type, state, hp) {
        super(id, name, rarity, type, state)
        this.hp = hp;
    }
    
    draw(x, y) {
        super.draw(x, y);
        textSize(Card.infoTextSize);
        text(`HP: ${this.hp}`, x, y  + (Card.height * 0.5), Card.width, Card.height * 0.5);
    } 
    
}

class SpellCard extends Card {
    constructor(id, name, rarity, type, state, attack) {
        super(id, name, rarity, type, state)
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

    constructor(title, cardsInfo, x, y, clickAction) {
        this.title = title;
        this.x = x;
        this.y = y;
        this.width = Card.width * PlayerHand.nCards;
        this.clickAction = clickAction;
        this.cards = this.createCards(cardsInfo);
    }

    createCards(cardsInfo) {
        let cards = [];
        for (let cardInfo of cardsInfo) {
            // cards.push(new Card(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state));
            if (cardInfo.type == 1) {
                cards.push(new MonsterCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.hp, cardInfo.attack));
            }
            else if (cardInfo.type == 2) {
                cards.push(new ShieldCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.hp));
            }
            else if (cardInfo.type == 3) {
                cards.push(new SpellCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state, cardInfo.attack));
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
            card.draw(x, 450);
            x += Card.width;
        }
    }

    click() {
        if (this.clickAction) {
            for (let card of this.cards) {
                if (card.click()) {
                    this.clickAction(card.card);
                }
            }
        }
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
            cards.push(new OppCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state));
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