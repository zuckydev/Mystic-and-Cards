class Card {
    static width = 150;
    static height = 200;
    static bgColor = [
        [0, 204, 0, 255], // Common
        [153, 51, 255, 255], // Epic
        [255, 255, 0, 255] // Legendary
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
            Card.bgColor[this.rarity][0], // Red
            Card.bgColor[this.rarity][1], // Green
            Card.bgColor[this.rarity][2], // Blue
            Card.bgColor[this.rarity][3]  // Alpha
        );

        rect(
            x,
            y,
            Card.width,
            Card.height
        );
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
}

class SpellCard extends Card {
    constructor(id, name, rarity, type, state, attack) {
        super(id, name, rarity, type, state)
        this.attack = attack;

    }
}

class ShieldCard extends Card {
    constructor(id, name, rarity, type, state, hp) {
        super(id, name, rarity, type, state)
        this.hp = hp;
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
        let monsterCards = [];
        let x = this.x;
        for (let cardInfo of cardsInfo) {
            console.log(cardInfo);
            cards.push(new Card(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state));
            if (cardInfo.type == 1) {
                monsterCards.push(new MonsterCard(cardInfo.id, cardInfo.name, cardInfo.rarity, cardInfo.type, cardInfo.state))
            }
            x += Card.width;
        }
        return cards;
    }
    
    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }

    draw () {
        textSize(28);
        textAlign(CENTER, CENTER);
        // text(this.title, this.x, this.y, this.width, 400);
        for (let card of this.cards) {
            card.draw(0, 0);
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